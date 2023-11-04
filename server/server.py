from fastapi import FastAPI
import re
from fastapi.responses import PlainTextResponse
import asyncio
from datetime import datetime, timedelta
from pydantic import BaseModel
import httpx
from fastapi.middleware.cors import CORSMiddleware
import openai
import dotenv
import os

try:
    dotenv.load_dotenv(".env")
except:
    pass

# openai.organization = os.environ["OPENAI_ORG"]
# openai.api_key = os.environ["OPENAI_API_KEY"]

app = FastAPI()

origins = [
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

BOOKING_URL = "https://www.booking.com/dml/graphql"


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


SYSTEM_PROMPT = """You are to be a travel agent who takes in a large number of attractions in a city and compiles them into an itinerary for a person who is looking to visit that region. The person will specify their goals and wishes for the trip, and you must personalize the itinerary for the person. Always reply with a travel plan, even if you don't have much data about a person.

You may schedule multiple attractions on one day if the time can fit, but should not schedule multiple events if they might overlap in time. Only state the ID of the attraction, the date of the attraction, and justify why you chose that attraction for the specific person. Justify how the attraction will help the person achieve their goals and wishes that they specify.

For example:

Day 1 (2021-06-01):
ID: 1
Date: 2021-06-01
Justification: <justification>

ID: 4
Date: 2021-06-01
Justification: <justification>

Day 2 (2021-06-02):
ID: 8
Date: 2021-06-02
Justification: <justification>

..."""
MODEL = "gpt-4"


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
                  "query": HOTEL_QUERY},
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


availability_query = 'query GetAvailabilityCalendar($input: AttractionAvailabilityCalendarInput, $contextParams: AttractionsContextParamsInput) {\n  attractionsProduct {\n    getAvailabilityCalendar(input: $input, contextParams: $contextParams) {\n      ... on AttractionAvailabilityCalendarResponse {\n        availabilityCalendar {\n          availableDates\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n'

query = "query SearchProducts($input: AttractionsProductSearchInput!, $contextParams: AttractionsContextParamsInput, $fullProductInfo: Boolean!) {\n  attractionsProduct {\n    searchProducts(input: $input, contextParams: $contextParams) {\n      ... on AttractionsProductSearchResponse {\n        filterOptions {\n          destinationFilters {\n            ...FilterOptionFragment\n            __typename\n          }\n          labelFilters {\n            ...FilterOptionFragment\n            __typename\n          }\n          priceFilters {\n            ...FilterOptionFragment\n            __typename\n          }\n          typeFilters {\n            ...FilterOptionFragment\n            __typename\n          }\n          ufiFilters {\n            ...FilterOptionFragment\n            __typename\n          }\n          __typename\n        }\n        filterStats {\n          filteredProductCount\n          unfilteredProductCount\n          __typename\n        }\n        unavailableProducts\n        products {\n          ...AttractionsProductFragment @include(if: $fullProductInfo)\n          ...AttractionsProductCardFragment @skip(if: $fullProductInfo)\n          __typename\n        }\n        sections {\n          attr_book_score {\n            ...AttractionsProductFragment @include(if: $fullProductInfo)\n            ...AttractionsProductCardFragment @skip(if: $fullProductInfo)\n            __typename\n          }\n          distance_to_hotel {\n            ...AttractionsProductFragment @include(if: $fullProductInfo)\n            ...AttractionsProductCardFragment @skip(if: $fullProductInfo)\n            __typename\n          }\n          trending {\n            ...AttractionsProductFragment @include(if: $fullProductInfo)\n            ...AttractionsProductCardFragment @skip(if: $fullProductInfo)\n            __typename\n          }\n          __typename\n        }\n        autoExtendBanner {\n          hasNearbyProducts\n          hasOwnProducts\n          nearbyProductFirstIndex\n          __typename\n        }\n        sorters {\n          name\n          value\n          __typename\n        }\n        defaultSorter {\n          name\n          value\n          __typename\n        }\n        noResultsForQuery\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment FilterOptionFragment on FilterOption {\n  image {\n    url\n    __typename\n  }\n  name\n  productCount\n  tagname\n  childFilterOptions {\n    name\n    tagname\n    productCount\n    __typename\n  }\n  __typename\n}\n\nfragment AttractionsProductFragment on AttractionsProduct {\n  accessibility\n  additionalInfo\n  additionalBookingInfo {\n    childRatesApplicability {\n      label\n      __typename\n    }\n    freeForChildren {\n      age {\n        label\n        __typename\n      }\n      __typename\n    }\n    onlyRegularTickets {\n      label\n      __typename\n    }\n    participantsPerBooking {\n      label\n      __typename\n    }\n    __typename\n  }\n  addresses {\n    arrival {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    attraction {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    departure {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    entrance {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    guestPickup {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    meeting {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    pickup {\n      ...AttractionsAddressFragment\n      __typename\n    }\n    __typename\n  }\n  applicableTerms {\n    policyProvider\n    __typename\n  }\n  audioSupportedLanguages\n  cancellationPolicy {\n    comparedTo\n    hasFreeCancellation\n    isStillRefundable\n    percentage\n    period\n    until\n    __typename\n  }\n  covid\n  dietOptions\n  description\n  guideSupportedLanguages\n  healthSafety\n  id\n  isBookable\n  labels {\n    text\n    type\n    __typename\n  }\n  name\n  notIncluded\n  offers {\n    additionalInfo\n    availabilityType\n    benefits {\n      freeAudioGuide {\n        label\n        value\n        __typename\n      }\n      freeDrink {\n        label\n        value\n        __typename\n      }\n      freeTransportation {\n        label\n        value\n        __typename\n      }\n      inStoreDiscount {\n        label\n        value\n        __typename\n      }\n      priorityLane {\n        label\n        value\n        __typename\n      }\n      skipTheLine {\n        label\n        value\n        __typename\n      }\n      __typename\n    }\n    description\n    id\n    items {\n      constraint {\n        label\n        maxAge\n        maxGroupSize\n        minAge\n        minGroupSize\n        numAdults\n        numChildren\n        numPeople\n        type\n        __typename\n      }\n      duration {\n        label\n        value\n        __typename\n      }\n      id\n      label\n      maxPerReservation\n      minPerReservation\n      tieredPricing\n      travelerCountRequired\n      type\n      __typename\n    }\n    label\n    languageOptions {\n      label\n      language\n      type\n      __typename\n    }\n    locationInstructions\n    notIncluded\n    reservationRestrictions {\n      adultRequiredForReservation\n      maxOfferItemsPerReservation\n      minOfferItemsPerReservation\n      __typename\n    }\n    typicalDuration {\n      label\n      value\n      __typename\n    }\n    typicalFrequency {\n      label\n      value\n      __typename\n    }\n    whatsIncluded\n    __typename\n  }\n  onSiteRequirements {\n    adultSupervisionRequired {\n      label\n      maxAge\n      __typename\n    }\n    age {\n      label\n      min\n      max\n      __typename\n    }\n    clothingCoveringShouldersKneesRequired {\n      label\n      __typename\n    }\n    comfortableFootwearRecommended {\n      label\n      __typename\n    }\n    drivingLicenseRequired {\n      label\n      __typename\n    }\n    earlyArrival {\n      label\n      minutes\n      __typename\n    }\n    height {\n      label\n      min\n      max\n      __typename\n    }\n    noAlcoholDuringDryDays {\n      label\n      __typename\n    }\n    noAlcoholDuringRamadan {\n      label\n      __typename\n    }\n    onlyOperatesInGoodWeather {\n      label\n      __typename\n    }\n    proofOfIdentityRequired {\n      label\n      __typename\n    }\n    ticketCollection {\n      label\n      __typename\n    }\n    unsuitable {\n      label\n      pregnant\n      reducedMobility\n      __typename\n    }\n    voucherPrintingRequired {\n      label\n      value\n      __typename\n    }\n    weight {\n      label\n      min\n      max\n      __typename\n    }\n    writtenConsentForChildren {\n      label\n      maxAge\n      __typename\n    }\n    __typename\n  }\n  operatedBy\n  photos {\n    ...PhotoTypesFragment\n    __typename\n  }\n  pickupTypes {\n    type\n    __typename\n  }\n  postBookingInfo\n  poweredBy\n  primaryLabel {\n    text\n    type\n    __typename\n  }\n  primaryPhoto {\n    ...PhotoTypesFragment\n    __typename\n  }\n  representativePrice {\n    chargeAmount\n    currency\n    publicAmount\n    __typename\n  }\n  restrictions\n  reviewsStats {\n    allReviewsCount\n    isGoodScore\n    percentage\n    numericStats {\n      average\n      total\n      __typename\n    }\n    providerNumericStats {\n      average\n      total\n      providerName\n      __typename\n    }\n    __typename\n  }\n  shortDescription\n  supplierInfo {\n    isIndividual\n    details {\n      address\n      name\n      __typename\n    }\n    __typename\n  }\n  supportedFeatures {\n    alternativeTimeSlotsPartiallySupported\n    alternativeTimeSlotsSupported\n    liveAvailabilityCheckPartiallySupported\n    liveAvailabilityCheckSupported\n    isDisneyProduct\n    __typename\n  }\n  slug\n  taxonomy {\n    categories {\n      label\n      slug\n      __typename\n    }\n    tags {\n      label\n      slug\n      __typename\n    }\n    type {\n      label\n      slug\n      __typename\n    }\n    __typename\n  }\n  timeZone\n  typicalDuration {\n    label\n    value\n    __typename\n  }\n  typicalFrequency {\n    label\n    value\n    __typename\n  }\n  ufi\n  ufiDetails {\n    ...UfiDetailsFragment\n    __typename\n  }\n  contextUfiDetails {\n    ...UfiDetailsFragment\n    __typename\n  }\n  uniqueSellingPoints\n  whatsIncluded\n  flags {\n    flag\n    value\n    rank\n    __typename\n  }\n  itinerary {\n    type\n    __typename\n  }\n  __typename\n}\n\nfragment AttractionsAddressFragment on AttractionsAddress {\n  address\n  city\n  country\n  googlePlaceId\n  id\n  instructions\n  latitude\n  locationType\n  longitude\n  publicTransport\n  zip\n  __typename\n}\n\nfragment PhotoTypesFragment on AttractionsPhoto {\n  hereProductPageDesktop\n  hereProductPageMobile\n  gallery\n  small\n  __typename\n}\n\nfragment UfiDetailsFragment on AttractionLocationResponse {\n  attractionsCount\n  bCityName\n  bInCityName\n  banners {\n    content\n    title\n    type\n    __typename\n  }\n  image\n  latitude\n  longitude\n  ufi\n  url {\n    city\n    country\n    prefix\n    __typename\n  }\n  countryName\n  __typename\n}\n\nfragment AttractionsProductCardFragment on AttractionsProduct {\n  id\n  slug\n  name\n  primaryPhoto {\n    small\n    __typename\n  }\n  cancellationPolicy {\n    hasFreeCancellation\n    __typename\n  }\n  shortDescription\n  ufiDetails {\n    bCityName\n    bInCityName\n    ufi\n    __typename\n  }\n  flags {\n    flag\n    value\n    rank\n    __typename\n  }\n  representativePrice {\n    chargeAmount\n    currency\n    publicAmount\n    __typename\n  }\n  reviewsStats {\n    allReviewsCount\n    isGoodScore\n    percentage\n    numericStats {\n      average\n      total\n      __typename\n    }\n    providerNumericStats {\n      average\n      total\n      providerName\n      __typename\n    }\n    __typename\n  }\n  typicalDuration {\n    label\n    __typename\n  }\n  primaryLabel {\n    text\n    type\n    __typename\n  }\n  __typename\n}\n"

HOTEL_QUERY = "query FullSearch($input: SearchQueryInput!, $geniusVipUI: GeniusVipUIsInput) {\n  searchQueries {\n    search(input: $input) {\n      ...FullSearchFragment\n      __typename\n    }\n    __typename\n  }\n  geniusVipEnrolledProgram(input: $geniusVipUI) {\n    ...geniusVipEnrolledProgram\n    __typename\n  }\n}\n\nfragment FullSearchFragment on SearchQueryOutput {\n  banners {\n    ...Banner\n    __typename\n  }\n  breadcrumbs {\n    ... on SearchResultsBreadcrumb {\n      ...SearchResultsBreadcrumb\n      __typename\n    }\n    ... on LandingPageBreadcrumb {\n      ...LandingPageBreadcrumb\n      __typename\n    }\n    __typename\n  }\n  carousels {\n    ...Carousel\n    __typename\n  }\n  destinationLocation {\n    ...DestinationLocation\n    __typename\n  }\n  entireHomesSearchEnabled\n  filters {\n    ...FilterData\n    __typename\n  }\n  appliedFilterOptions {\n    ...FilterOption\n    __typename\n  }\n  recommendedFilterOptions {\n    ...FilterOption\n    __typename\n  }\n  pagination {\n    nbResultsPerPage\n    nbResultsTotal\n    __typename\n  }\n  tripTypes {\n    ...TripTypesData\n    __typename\n  }\n  results {\n    ...BasicPropertyData\n    ...MatchingUnitConfigurations\n    ...PropertyBlocks\n    ...BookerExperienceData\n    priceDisplayInfo {\n      ...PriceDisplayInfo\n      __typename\n    }\n    priceDisplayInfoIrene {\n      ...PriceDisplayInfoIrene\n      __typename\n    }\n    licenseDetails {\n      nextToHotelName\n      __typename\n    }\n    inferredLocationScore\n    __typename\n  }\n  searchMeta {\n    ...SearchMetadata\n    __typename\n  }\n  sorters {\n    option {\n      ...SorterFields\n      __typename\n    }\n    __typename\n  }\n  oneOfThreeDeal {\n    ...OneOfThreeDeal\n    __typename\n  }\n  zeroResultsSection {\n    ...ZeroResultsSection\n    __typename\n  }\n  __typename\n}\n\nfragment BasicPropertyData on SearchResultProperty {\n  acceptsWalletCredit\n  basicPropertyData {\n    accommodationTypeId\n    id\n    isTestProperty\n    location {\n      address\n      city\n      countryCode\n      __typename\n    }\n    pageName\n    ufi\n    photos {\n      main {\n        highResUrl {\n          relativeUrl\n          __typename\n        }\n        lowResUrl {\n          relativeUrl\n          __typename\n        }\n        highResJpegUrl {\n          relativeUrl\n          __typename\n        }\n        lowResJpegUrl {\n          relativeUrl\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    reviewScore: reviews {\n      score: totalScore\n      reviewCount: reviewsCount\n      totalScoreTextTag {\n        translation\n        __typename\n      }\n      showScore\n      secondaryScore\n      secondaryTextTag {\n        translation\n        __typename\n      }\n      showSecondaryScore\n      __typename\n    }\n    externalReviewScore: externalReviews {\n      score: totalScore\n      reviewCount: reviewsCount\n      showScore\n      totalScoreTextTag {\n        translation\n        __typename\n      }\n      __typename\n    }\n    alternativeExternalReviewsScore: alternativeExternalReviews {\n      score: totalScore\n      reviewCount: reviewsCount\n      showScore\n      totalScoreTextTag {\n        translation\n        __typename\n      }\n      __typename\n    }\n    starRating {\n      value\n      symbol\n      caption {\n        translation\n        __typename\n      }\n      tocLink {\n        translation\n        __typename\n      }\n      showAdditionalInfoIcon\n      __typename\n    }\n    isClosed\n    paymentConfig {\n      installments {\n        minPriceFormatted\n        maxAcceptCount\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  badges {\n    caption {\n      translation\n      __typename\n    }\n    closedFacilities {\n      startDate\n      endDate\n      __typename\n    }\n    __typename\n  }\n  customBadges {\n    showIsWorkFriendly\n    showParkAndFly\n    showSkiToDoor\n    showBhTravelCreditBadge\n    showOnlineCheckinBadge\n    __typename\n  }\n  description {\n    text\n    __typename\n  }\n  displayName {\n    text\n    translationTag {\n      translation\n      __typename\n    }\n    __typename\n  }\n  geniusInfo {\n    benefitsCommunication {\n      header {\n        title\n        __typename\n      }\n      items {\n        title\n        __typename\n      }\n      __typename\n    }\n    geniusBenefits\n    geniusBenefitsData {\n      hotelCardHasFreeBreakfast\n      hotelCardHasFreeRoomUpgrade\n      sortedBenefits\n      __typename\n    }\n    showGeniusRateBadge\n    __typename\n  }\n  isInCompanyBudget\n  location {\n    displayLocation\n    mainDistance\n    publicTransportDistanceDescription\n    skiLiftDistance\n    beachDistance\n    nearbyBeachNames\n    beachWalkingTime\n    geoDistanceMeters\n    __typename\n  }\n  mealPlanIncluded {\n    mealPlanType\n    text\n    __typename\n  }\n  persuasion {\n    autoextended\n    geniusRateAvailable\n    highlighted\n    preferred\n    preferredPlus\n    showNativeAdLabel\n    nativeAdId\n    nativeAdsCpc\n    nativeAdsTracking\n    bookedXTimesMessage\n    __typename\n  }\n  policies {\n    showFreeCancellation\n    showNoPrepayment\n    enableJapaneseUsersSpecialCase\n    __typename\n  }\n  ribbon {\n    ribbonType\n    text\n    __typename\n  }\n  recommendedDate {\n    checkin\n    checkout\n    lengthOfStay\n    __typename\n  }\n  showGeniusLoginMessage\n  showPrivateHostMessage\n  soldOutInfo {\n    isSoldOut\n    messages {\n      text\n      __typename\n    }\n    alternativeDatesMessages {\n      text\n      __typename\n    }\n    __typename\n  }\n  nbWishlists\n  visibilityBoosterEnabled\n  showAdLabel\n  isNewlyOpened\n  propertySustainability {\n    isSustainable\n    tier {\n      type\n      __typename\n    }\n    facilities {\n      id\n      __typename\n    }\n    certifications {\n      name\n      __typename\n    }\n    chainProgrammes {\n      chainName\n      programmeName\n      __typename\n    }\n    levelId\n    __typename\n  }\n  seoThemes {\n    caption\n    __typename\n  }\n  relocationMode {\n    distanceToCityCenterKm\n    distanceToCityCenterMiles\n    distanceToOriginalHotelKm\n    distanceToOriginalHotelMiles\n    phoneNumber\n    __typename\n  }\n  bundleRatesAvailable\n  recommendedDatesLabel\n  __typename\n}\n\nfragment Banner on Banner {\n  name\n  type\n  isDismissible\n  showAfterDismissedDuration\n  position\n  requestAlternativeDates\n  title {\n    text\n    __typename\n  }\n  imageUrl\n  paragraphs {\n    text\n    __typename\n  }\n  metadata {\n    key\n    value\n    __typename\n  }\n  pendingReviewInfo {\n    propertyPhoto {\n      lowResUrl {\n        relativeUrl\n        __typename\n      }\n      lowResJpegUrl {\n        relativeUrl\n        __typename\n      }\n      __typename\n    }\n    propertyName\n    urlAccessCode\n    __typename\n  }\n  nbDeals\n  primaryAction {\n    text {\n      text\n      __typename\n    }\n    action {\n      name\n      context {\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  secondaryAction {\n    text {\n      text\n      __typename\n    }\n    action {\n      name\n      context {\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  iconName\n  flexibleFilterOptions {\n    optionId\n    filterName\n    __typename\n  }\n  trackOnView {\n    type\n    experimentHash\n    value\n    __typename\n  }\n  dateFlexQueryOptions {\n    text {\n      text\n      __typename\n    }\n    action {\n      name\n      context {\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    isApplied\n    __typename\n  }\n  __typename\n}\n\nfragment Carousel on Carousel {\n  aggregatedCountsByFilterId\n  carouselId\n  position\n  contentType\n  hotelId\n  name\n  soldoutProperties\n  priority\n  themeId\n  title {\n    text\n    __typename\n  }\n  slides {\n    captionText {\n      text\n      __typename\n    }\n    name\n    photoUrl\n    subtitle {\n      text\n      __typename\n    }\n    type\n    title {\n      text\n      __typename\n    }\n    action {\n      context {\n        key\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment DestinationLocation on DestinationLocation {\n  name {\n    text\n    __typename\n  }\n  inName {\n    text\n    __typename\n  }\n  countryCode\n  __typename\n}\n\nfragment FilterData on Filter {\n  trackOnView {\n    type\n    experimentHash\n    value\n    __typename\n  }\n  trackOnClick {\n    type\n    experimentHash\n    value\n    __typename\n  }\n  name\n  field\n  category\n  filterStyle\n  title {\n    text\n    translationTag {\n      translation\n      __typename\n    }\n    __typename\n  }\n  subtitle\n  options {\n    trackOnView {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnClick {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnSelect {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnDeSelect {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnViewPopular {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnClickPopular {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnSelectPopular {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnDeSelectPopular {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    ...FilterOption\n    __typename\n  }\n  filterLayout {\n    isCollapsable\n    collapsedCount\n    __typename\n  }\n  stepperOptions {\n    min\n    max\n    default\n    selected\n    title {\n      text\n      translationTag {\n        translation\n        __typename\n      }\n      __typename\n    }\n    field\n    labels {\n      text\n      translationTag {\n        translation\n        __typename\n      }\n      __typename\n    }\n    trackOnView {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnClick {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnSelect {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnDeSelect {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnClickDecrease {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnClickIncrease {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnDecrease {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    trackOnIncrease {\n      type\n      experimentHash\n      value\n      __typename\n    }\n    __typename\n  }\n  sliderOptions {\n    min\n    max\n    minSelected\n    maxSelected\n    minPriceStep\n    minSelectedFormatted\n    currency\n    histogram\n    selectedRange {\n      translation\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment FilterOption on Option {\n  optionId: id\n  count\n  selected\n  urlId\n  additionalLabel {\n    text\n    translationTag {\n      translation\n      __typename\n    }\n    __typename\n  }\n  value {\n    text\n    translationTag {\n      translation\n      __typename\n    }\n    __typename\n  }\n  starRating {\n    value\n    symbol\n    caption {\n      translation\n      __typename\n    }\n    showAdditionalInfoIcon\n    __typename\n  }\n  __typename\n}\n\nfragment LandingPageBreadcrumb on LandingPageBreadcrumb {\n  destType\n  name\n  urlParts\n  __typename\n}\n\nfragment MatchingUnitConfigurations on SearchResultProperty {\n  matchingUnitConfigurations {\n    commonConfiguration {\n      name\n      unitId\n      bedConfigurations {\n        beds {\n          count\n          type\n          __typename\n        }\n        nbAllBeds\n        __typename\n      }\n      nbAllBeds\n      nbBathrooms\n      nbBedrooms\n      nbKitchens\n      nbLivingrooms\n      nbPools\n      nbUnits\n      unitTypeNames {\n        translation\n        __typename\n      }\n      localizedArea {\n        localizedArea\n        unit\n        __typename\n      }\n      __typename\n    }\n    unitConfigurations {\n      name\n      unitId\n      bedConfigurations {\n        beds {\n          count\n          type\n          __typename\n        }\n        nbAllBeds\n        __typename\n      }\n      apartmentRooms {\n        config {\n          roomId: id\n          roomType\n          bedTypeId\n          bedCount: count\n          __typename\n        }\n        roomName: tag {\n          tag\n          translation\n          __typename\n        }\n        __typename\n      }\n      nbAllBeds\n      nbBathrooms\n      nbBedrooms\n      nbKitchens\n      nbLivingrooms\n      nbPools\n      nbUnits\n      unitTypeNames {\n        translation\n        __typename\n      }\n      localizedArea {\n        localizedArea\n        unit\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment PropertyBlocks on SearchResultProperty {\n  blocks {\n    blockId {\n      roomId\n      occupancy\n      policyGroupId\n      packageId\n      mealPlanId\n      __typename\n    }\n    finalPrice {\n      amount\n      currency\n      __typename\n    }\n    originalPrice {\n      amount\n      currency\n      __typename\n    }\n    onlyXLeftMessage {\n      tag\n      variables {\n        key\n        value\n        __typename\n      }\n      translation\n      __typename\n    }\n    freeCancellationUntil\n    hasCrib\n    blockMatchTags {\n      childStaysForFree\n      __typename\n    }\n    thirdPartyInventoryContext {\n      isTpiBlock\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment PriceDisplayInfo on PriceDisplayInfo {\n  badges {\n    name {\n      translation\n      __typename\n    }\n    tooltip {\n      translation\n      __typename\n    }\n    style\n    identifier\n    __typename\n  }\n  chargesInfo {\n    translation\n    __typename\n  }\n  displayPrice {\n    copy {\n      translation\n      __typename\n    }\n    amountPerStay {\n      amount\n      amountRounded\n      amountUnformatted\n      currency\n      __typename\n    }\n    __typename\n  }\n  priceBeforeDiscount {\n    copy {\n      translation\n      __typename\n    }\n    amountPerStay {\n      amount\n      amountRounded\n      amountUnformatted\n      currency\n      __typename\n    }\n    __typename\n  }\n  rewards {\n    rewardsList {\n      termsAndConditions\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      breakdown {\n        productType\n        amountPerStay {\n          amount\n          amountRounded\n          amountUnformatted\n          currency\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    rewardsAggregated {\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      copy {\n        translation\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  useRoundedAmount\n  discounts {\n    amount {\n      amount\n      amountRounded\n      amountUnformatted\n      currency\n      __typename\n    }\n    name {\n      translation\n      __typename\n    }\n    description {\n      translation\n      __typename\n    }\n    itemType\n    __typename\n  }\n  excludedCharges {\n    excludeChargesAggregated {\n      copy {\n        translation\n        __typename\n      }\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      __typename\n    }\n    excludeChargesList {\n      chargeMode\n      chargeInclusion\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  taxExceptions {\n    shortDescription {\n      translation\n      __typename\n    }\n    longDescription {\n      translation\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment PriceDisplayInfoIrene on PriceDisplayInfoIrene {\n  badges {\n    name {\n      translation\n      __typename\n    }\n    tooltip {\n      translation\n      __typename\n    }\n    style\n    identifier\n    __typename\n  }\n  chargesInfo {\n    translation\n    __typename\n  }\n  displayPrice {\n    copy {\n      translation\n      __typename\n    }\n    amountPerStay {\n      amount\n      amountRounded\n      amountUnformatted\n      currency\n      __typename\n    }\n    __typename\n  }\n  priceBeforeDiscount {\n    copy {\n      translation\n      __typename\n    }\n    amountPerStay {\n      amount\n      amountRounded\n      amountUnformatted\n      currency\n      __typename\n    }\n    __typename\n  }\n  rewards {\n    rewardsList {\n      termsAndConditions\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      breakdown {\n        productType\n        amountPerStay {\n          amount\n          amountRounded\n          amountUnformatted\n          currency\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    rewardsAggregated {\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      copy {\n        translation\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  useRoundedAmount\n  discounts {\n    amount {\n      amount\n      amountRounded\n      amountUnformatted\n      currency\n      __typename\n    }\n    name {\n      translation\n      __typename\n    }\n    description {\n      translation\n      __typename\n    }\n    itemType\n    productId\n    __typename\n  }\n  excludedCharges {\n    excludeChargesAggregated {\n      copy {\n        translation\n        __typename\n      }\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      __typename\n    }\n    excludeChargesList {\n      chargeMode\n      chargeInclusion\n      chargeType\n      amountPerStay {\n        amount\n        amountRounded\n        amountUnformatted\n        currency\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  taxExceptions {\n    shortDescription {\n      translation\n      __typename\n    }\n    longDescription {\n      translation\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment BookerExperienceData on SearchResultProperty {\n  bookerExperienceContentUIComponentProps {\n    ... on BookerExperienceContentLoyaltyBadgeListProps {\n      badges {\n        variant\n        key\n        title\n        popover\n        logoSrc\n        logoAlt\n        __typename\n      }\n      __typename\n    }\n    ... on BookerExperienceContentFinancialBadgeProps {\n      paymentMethod\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment SearchMetadata on SearchMeta {\n  availabilityInfo {\n    hasLowAvailability\n    unavailabilityPercent\n    totalAvailableNotAutoextended\n    __typename\n  }\n  boundingBoxes {\n    swLat\n    swLon\n    neLat\n    neLon\n    type\n    __typename\n  }\n  childrenAges\n  dates {\n    checkin\n    checkout\n    lengthOfStayInDays\n    __typename\n  }\n  destId\n  destType\n  maxLengthOfStayInDays\n  nbRooms\n  nbAdults\n  nbChildren\n  userHasSelectedFilters\n  customerValueStatus\n  affiliatePartnerChannelId\n  affiliateVerticalType\n  __typename\n}\n\nfragment SearchResultsBreadcrumb on SearchResultsBreadcrumb {\n  destId\n  destType\n  name\n  __typename\n}\n\nfragment SorterFields on SorterOption {\n  type: name\n  captionTranslationTag {\n    translation\n    __typename\n  }\n  tooltipTranslationTag {\n    translation\n    __typename\n  }\n  isSelected: selected\n  __typename\n}\n\nfragment OneOfThreeDeal on OneOfThreeDeal {\n  id\n  uuid\n  winnerHotelId\n  winnerBlockId\n  priceDisplayInfo {\n    displayPrice {\n      amountPerStay {\n        amountRounded\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  locationInfo {\n    name\n    inName\n    destType\n    __typename\n  }\n  destinationType\n  commonFacilities {\n    id\n    name\n    __typename\n  }\n  properties {\n    priceDisplayInfo {\n      priceBeforeDiscount {\n        amountPerStay {\n          amountRounded\n          __typename\n        }\n        __typename\n      }\n      displayPrice {\n        amountPerStay {\n          amountRounded\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    basicPropertyData {\n      id\n      name\n      pageName\n      photos {\n        main {\n          highResUrl {\n            absoluteUrl\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      location {\n        address\n        countryCode\n        __typename\n      }\n      reviews {\n        reviewsCount\n        totalScore\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment TripTypesData on TripTypes {\n  beach {\n    isBeachUfi\n    isEnabledBeachUfi\n    isCoastalBeachRegion\n    isBeachDestinationWithoutBeach\n    __typename\n  }\n  ski {\n    isSkiExperience\n    isSkiScaleUfi\n    __typename\n  }\n  skiResorts {\n    name\n    resortId\n    localizedTrailDistance\n    photoUrl\n    __typename\n  }\n  carouselBeach {\n    name\n    beachId\n    photoUrl\n    reviewScore\n    reviewScoreFormatted\n    translatedBeachActivities\n    translatedSandType\n    __typename\n  }\n  highestTrafficSkiRegionOfMultiRegionLowAVUfi {\n    regionId\n    regionName\n    photoUrl\n    skiRegionUfiData {\n      cityName\n      __typename\n    }\n    __typename\n  }\n  skiLandmarkData {\n    resortId\n    slopeTotalLengthFormatted\n    totalLiftsCount\n    __typename\n  }\n  __typename\n}\n\nfragment ZeroResultsSection on ZeroResultsSection {\n  title {\n    text\n    __typename\n  }\n  primaryAction {\n    text {\n      text\n      __typename\n    }\n    action {\n      name\n      __typename\n    }\n    __typename\n  }\n  paragraphs {\n    text\n    __typename\n  }\n  type\n  __typename\n}\n\nfragment geniusVipEnrolledProgram on GeniusVipEnrolledProgram {\n  metadata {\n    programType\n    __typename\n  }\n  geniusVipUIs {\n    searchResultModal {\n      title {\n        text\n        __typename\n      }\n      subtitle {\n        text\n        __typename\n      }\n      modalCategory\n      asset {\n        __typename\n        ... on Image {\n          url\n          __typename\n        }\n      }\n      cta {\n        text\n        actionString\n        actionDismiss\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n"