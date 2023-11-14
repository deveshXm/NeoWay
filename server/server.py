from fastapi import FastAPI
import re
from fastapi.responses import PlainTextResponse
import asyncio
from datetime import datetime, timedelta
from pydantic import BaseModel
import httpx
from fastapi.middleware.cors import CORSMiddleware
from queries import query, availability_query, hotel_query
from constants import BOOKING_URL, origins
from openAI import SYSTEM_PROMPT, MODEL
import openai
import dotenv
import os


try:
    dotenv.load_dotenv(".env")
except:
    pass

openai.api_key = os.environ["OPENAI_API_KEY"]

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


def json_to_text(data, dates):
    options = []  # Charge amount is in USD, maybe use a converter API

    for i, (item, date) in enumerate(zip(data, dates)):
        string = ""
        string += f"ID: {i}\n"
        string += f"Location: {item['ufiDetails']['bCityName']}, {item['ufiDetails']['countryName']}\n"
        string += f"Name: {item['name']}\n"
        string += f"Price: {item['representativePrice']['chargeAmount']}\n"
        string += f"Dates Available: " + ", ".join(
            span['start_date'].strftime('%Y-%m-%d') + " to " + span["end_date"].strftime('%Y-%m-%d') for span in date)
        string += "\n"
        try:
            string += f"{item['offers'][0]['typicalDuration']['label']}\n"
        except:
            pass
        string += f"Description: {item['description']}"
        options.append(string)
    return options





@app.get("/results")
async def locations(ufi: int, personalization: str, end_date: str, start_date: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            BOOKING_URL,
            json=
            {
                "operationName": "SearchProducts",
                "variables": {
                    "input": {
                        "filterByEndDate": end_date,
                        "filterByStartDate": start_date,
                        "ufi": ufi,
                        "extractFilterStats": True,
                        "extractFilterOptions": True,
                        "extractSorters": True,
                        "extractSections": False,
                        "limit": 25,
                        "source": "search_results",
                        "page": 1
                    },
                    "contextParams": {
                        "urlCode": "",
                        "test": False,
                        "showInactive": False,
                        "source": "",
                        "adPlat": "",
                        "label": ""
                    },
                    "fullProductInfo": True
                },
                "extensions": {},
                "query": query,
            }
        )

        data = res.json()

        products = data["data"]["attractionsProduct"]["searchProducts"]["products"]

        information = []
        not_want = ["uniqueSellingPoints", "labels", "itinerary", "poweredBy", "__typename", "accessibility",
                    "supplierInfo", "postBookingInfo", "primaryLabel", "operatedBy", "flags", "applicableTerms",
                    "onSiteRequirements", "covid", "guideSupportedLanguages", "audioSupportedLanguages", "healthSafety",
                    "contextUfiDetails", "isBookable", "additionalBookingInfo", "typicalFrequency", "supportedFeatures"]
        not_want = []

        for i, product in enumerate(products):
            information.append({})
            for key, value in product.items():
                if key == "description":
                    information[i][key] = value.replace("\r", "").replace("\n\n", "\n").replace("\n", " ")
                elif key not in not_want:
                    information[i][key] = value

        dates = await asyncio.gather(*[get_dates(client, info["id"], start_date, end_date) for info in information])

        while True:
            try:
                model_input = "\n\n".join(json_to_text(information, dates))
                response = openai.ChatCompletion.create(
                    model=MODEL,
                    messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": model_input}, {"role": "user", "content": personalization + f"\n\nI will arrive {start_date} and depart {end_date}"}],
                )
                content = response["choices"][0]["message"]["content"]
                content = re.sub(r'\s\(ID \d+?\)\s', ' ', content)
                days = content.replace("):\n\nID:", "):\nID:").split("\nDay ")
                schedule_per_day = {}
                ids = []

                for day in days:
                    a = day.split(":\n")
                    day_id = a[0]
                    split_day = day_id.split(" ")
                    if len(split_day) == 2 and split_day[0].isdigit() and split_day[1].startswith("("):
                        activities = a[1].split("\n\n")
                        rest = list(filter(lambda x: x and ("ID" in x and "Date" in x and "Justification" in x), [dict(map(lambda x: (x[0], x[1].strip()),
                                                        filter(lambda x: len(x) == 2, chunks(re.split("\n|:", act), 2)))) for
                                                act in activities]))
                        if len(rest) == 0:
                            continue
                        ids.extend([int(r["ID"]) for r in rest])
                        schedule_per_day[day_id] = rest
                break
            except:
                print("regenerating content (in try/except)...")

        return {"schedule": schedule_per_day, "bookings": {i: information[i] for i in ids}}


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


async def get_dates(session, ufi, start_date, end_date):
    res = await session.post(
        BOOKING_URL,
        json={
            "extensions": {},
            "operationName": "GetAvailabilityCalendar",
            "query": availability_query,
            "variables": {
                "input": {
                    "id": ufi
                },
                "contextParams": {
                    "urlCode": "",
                    "test": False,
                    "showInactive": False,
                }
            }
        }
    )
    dates = res.json()
    dates = dates["data"]["attractionsProduct"]["getAvailabilityCalendar"]["availabilityCalendar"]["availableDates"]
    date_ranges = list(find_date_windows(dates, start_date, end_date))

    return date_ranges


ONE_DAY = timedelta(days=1)


def find_date_windows(dates, start_date, end_date):
    # guard against getting empty list
    if not dates:
        return

    start_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%Y-%m-%d')

    # convert strings to sorted list of datetime.dates
    dates = [o for o in (datetime.strptime(d, '%Y-%m-%d') for d in dates) if o >= start_date and o <= end_date]
    dates.sort()

    # build list of window starts and matching ends
    lastStart = lastEnd = dates[0]
    for d in dates[1:]:
        if d - lastEnd > ONE_DAY:
            yield {'start_date': lastStart, 'end_date': lastEnd}
            lastStart = d
        lastEnd = d
    yield {'start_date': lastStart, 'end_date': lastEnd}


@app.get("/destinations")
async def destinations(query: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            BOOKING_URL,
            json={
                "operationName": "SearchAutoComplete",
                "variables": {
                    "input": {"limit": 4, "query": query},
                    "contextParams": {
                        "urlCode": "",
                        "test": False,
                        "showInactive": False,
                        "source": "",
                        "adPlat": "",
                        "label": "gen173nr-1FCAEoggI46AdIM1gEaCeIAQGYATG4AQfIAQzYAQHoAQH4AQKIAgGoAgO4ApSq2KQGwAIB0gIkMjAwNjEwZjMtZjViMS00N2M3LWE1MTEtNzVmYzYwOWMyYTFl2AIF4AIB",
                    },
                },
                "extensions": {},
                "query": "query SearchAutoComplete($input: AttractionsSearchAutoCompleteInput!, $contextParams: AttractionsContextParamsInput) {\n  attractionsProduct {\n    searchAutoComplete(input: $input, contextParams: $contextParams) {\n      __typename\n      ... on AttractionsSearchAutoCompleteResponse {\n        products {\n          ...AttractionsSearchProductSuggestionFragment\n          __typename\n        }\n        destinations {\n          ...AttractionsSearchDestinationSuggestionFragment\n          __typename\n        }\n        __typename\n      }\n      ... on AttractionsOrchestratorErrorResponse {\n        error\n        message\n        statusCode\n        __typename\n      }\n    }\n    __typename\n  }\n}\n\nfragment AttractionsSearchProductSuggestionFragment on AttractionsSearchProductSuggestion {\n  title\n  productId\n  productSlug\n  taxonomySlug\n  imageUrl\n  cityUfi\n  cityName\n  cityUrlName\n  countryCode\n  tracking {\n    prid\n    prPageViewId\n    __typename\n  }\n  __typename\n}\n\nfragment AttractionsSearchDestinationSuggestionFragment on AttractionsSearchDestinationSuggestion {\n  region\n  ufi\n  cc1\n  cityUrl\n  srUrl\n  productCount\n  destType\n  country\n  cityName\n  imageUrl\n  __typename\n}\n",
            },
        )

        return res.json()["data"]["attractionsProduct"]["searchAutoComplete"]["destinations"]


@app.get("/flightDestinations")
async def flightDestinations(query: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://flights.booking.com/api/autocomplete/en?q={query}&accessToken=",
        )

        return res.json()


class HotelRequest(BaseModel):
    adults: int
    children: int
    cityName: str
    ufi: int
    departDate: str
    returnDate: str
    maxPrice: int


@app.post("/hotels")
async def hotels(body: HotelRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            BOOKING_URL,
            params={
                "ss": body.cityName,
                "ssne": body.cityName,
                "ssne_untouched": body.cityName,
                "lang": "en-us",
                "src": "searchresults",
                "dest_id": body.ufi,
                "dest_type": "city",
                "checkin": body.departDate,
                "checkout": body.returnDate,
                "group_adults": body.adults,
                "group_children": body.children,
                "no_rooms": 1,
            },
            json={"operationName": "FullSearch", "variables": {
                "input": {"acidCarouselContext": None, "childrenAges": [],
                          "dates": {"checkin": body.departDate, "checkout": body.returnDate},
                          "doAvailabilityCheck": False, "encodedAutocompleteMeta": None, "enableCampaigns": True,
                          "filters": {"selectedFilters": f"price=CAD-min-{body.maxPrice}-1"}, "forcedBlocks": None,
                          "location": {"searchString": body.cityName, "destType": "CITY", "destId": body.ufi},
                          "metaContext": {"metaCampaignId": 0, "externalTotalPrice": None, "feedPrice": None,
                                          "rateRuleId": None, "dragongateTraceId": None}, "nbRooms": 1, "nbAdults": 2,
                          "nbChildren": 0, "showAparthotelAsHotel": True, "needsRoomsMatch": False,
                          "optionalFeatures": {"forceArpExperiments": True, "testProperties": False},
                          "pagination": {"rowsPerPage": 25, "offset": 0},
                          "rawQueryForSession": "/searchresults.html?label=gen173nr-1BCAEoggI46AdIM1gEaCeIAQGYATG4AQfIAQzYAQHoAQGIAgGoAgO4ArCj2aQGwAIB0gIkODI5YmM1N2UtY2VkYS00NTczLTljZGYtNGY4NDhhN2RmY2Mw2AIF4AIB&aid=304142&ss=Toronto&ssne=Toronto&ssne_untouched=Toronto&lang=en-us&src=searchresults&dest_id=-574890&dest_type=city&checkin=2023-07-04&checkout=2023-07-19&group_adults=2&no_rooms=1&group_children=0&nflt=price%3DCAD-min-700-1",
                          "referrerBlock": None,
                          "sorters": {"selectedSorter": None, "referenceGeoId": None, "tripTypeIntentId": None},
                          "travelPurpose": 2, "seoThemeIds": [], "useSearchParamsFromSession": True},
                "geniusVipUI": {"enableEnroll": True, "page": "SEARCH_RESULTS"}}, "extensions": {},
                  "query": hotel_query},
            headers={
                "Accept": "*/*",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0",
                "Accept-Language": "en-US,en;q=0.5",
                "X-Requested-From": "clientFetch",
            },
            timeout=None
        )

        result = res.json()
        hotels = result["data"]["searchQueries"]["search"]["results"]
        if len(hotels) == 0:
            return {"error": "No hotels found to satisfy your budget! Try increasing your budget or decreasing the duration of your trip."}
        offers = hotels[0]

        return offers


class Location(BaseModel):
    code: str
    city: str
    cityName: str
    country: str


class GetFlights(BaseModel):
    adults: int
    children: int
    departDate: str
    returnDate: str
    fromLocation: Location
    toLocation: Location
    flightBudget: int


@app.post("/flightsToDestination")
async def flightsToDestination(body: GetFlights):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"https://flights.booking.com/api/flights/",
            params={
                "type": "ROUNDTRIP",
                "adults": body.adults,
                "cabinClass": "ECONOMY",
                "children": body.children,
                "from": body.fromLocation.city + ".CITY",
                "to": body.toLocation.city + ".CITY",
                "fromCountry": body.fromLocation.country,
                "toCountry": body.toLocation.country,
                "fromLocationName": body.fromLocation.cityName,
                "toLocationName": body.toLocation.cityName,
                "depart": body.departDate,
                "return": body.returnDate,
                "sort": "BEST",
                "travelPurpose": "leisure",
                "aid": 304142,
                "label": "gen173nr-1FEghwYWNrYWdlcyiCAjjoB0gzWARoJ4gBAZgBMbgBB8gBDNgBAegBAfgBAogCAagCA7gCvrPYpAbAAgHSAiQ5ZDQ1MDI0Ny1jMzEyLTQ3YzUtYWI5My0zN2EyYTcwNjk3ZjHYAgXgAgE",
                "enableVI": 1
            },
            headers={
                "Accept": "*/*",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0",
                "Accept-Language": "en-US,en;q=0.5",
                "X-Requested-From": "clientFetch",
                "X-Flights-Context-Name": "search_results",
                "X-Booking-Affiliate-Id": "304142",
                "X-Booking-Label": "gen173nr-1FEghwYWNrYWdlcyiCAjjoB0gzWARoJ4gBAZgBMbgBB8gBDNgBAegBAfgBAogCAagCA7gCvrPYpAbAAgHSAiQ5ZDQ1MDI0Ny1jMzEyLTQ3YzUtYWI5My0zN2EyYTcwNjk3ZjHYAgXgAgE"
            },
            timeout=None
        )

        offers = res.json()
        if "error" in offers:
            # no flight
            return []

        offers = offers["flightOffers"]
        difference = 10000000
        closestToBudget = 0
        for i, offer in enumerate(offers[1:]):
            price = sum([item["travellerPriceBreakdown"]["total"]["units"] for item in offer["travellerPrices"]])
            newDiff = abs(price - body.flightBudget)

            if newDiff < difference:
                difference = newDiff
                closestToBudget = i + 1

        offerToUse = offers[closestToBudget]

        return {"details": offerToUse["segments"], "price": sum(
            [item["travellerPriceBreakdown"]["total"]["units"] for item in offerToUse["travellerPrices"]])}


