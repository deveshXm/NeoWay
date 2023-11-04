from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from message import Message
from typing import List
from openai import PROMPT, MODEL

import openai
import dotenv
import os
import json
import requests

try:
    dotenv.load_dotenv(".env")
except:
    pass

openai.api_key = os.environ["OPENAI_API_KEY"]
# rapid_api_key = os.environ["RAPID_API_KEY"]

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#Healtcheck
@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}


@app.post("/chat", response_model=dict)
async def chat(messages: List[Message], state: dict = None):
    response = on_message(messages, state)
    if type(response) is tuple:
        bot_response, new_state = response
        return {
            "botResponse": {"content": bot_response, "role": "assistant"},
            "newState": new_state,
        }
    elif type(response) is str:
        return {"botResponse": {"content": response, "role": "assistant"}}


def on_message(message_history: List[Message], state: dict = None):
    if state is None or "counter" not in state:
        state = {"counter": 0}
    else:
        state["counter"] += 1

    functions = [
        {
            "name": "get_trip_details",
            "description": "Get Trip Details for the user based on inputs",
            "parameters": {
                "type": "object",
                "properties": {
                    "destination": {
                        "type": "string",
                        "description": "city in which trip ends",
                    },
                    "trip start date": {
                        "type": "string",
                        "description": "Date on which trip starts",
                    },
                    "trip end date": {
                        "type": "string",
                        "description": "Date on which trip ends",
                    },
                    "trip budget": {
                        "type": "string",
                        "description": "Budget of the trip",
                    },
                    "trip type": {
                        "type": "string",
                        "description": "Type of the trip eg Business, Family or Friends.",
                    },
                    "number of travelers": {
                        "type": "string",
                        "description": "Number of people that will travel",
                    },
                },
                "required": [
                    "destination",
                    "trip start date",
                    "trip end date",
                    "trip budget",
                    "number of travelers",
                ],
            },
        }
    ]

    # Generate Response use Chat Completion
    response = openai.ChatCompletion.create(
        temperature=0.7,
        max_tokens=1000,
        messages=[
            {"role": "system", "content": PROMPT},
            *map(dict, message_history),
        ],
        functions=functions,
        function_call="auto",
        model=MODEL,
    )

    if response["choices"][0]["finish_reason"] == "function_call":
        # generate second response if all the necessary details are fetched from user
        data = json.loads(
            response["choices"][0]["message"]["function_call"]["arguments"]
        )
        city = data["destination"]
        startDate = data["trip start date"]
        endDate = data["trip end date"]
        guestQty = data["number of travelers"]
        
        
        # If the prompt was used before then fetch the Record from Database otherwise create new Record
        hotels = get_hotel_details(city, startDate, endDate, guestQty)
        second_response = openai.ChatCompletion.create(
            temperature=0.7,
            max_tokens=1000,
            messages=[
                {"role": "system", "content": PROMPT},
                *map(dict, message_history),
            ],
            model=MODEL,
        )

        final_response = (
            second_response["choices"][0]["message"]["content"]
            + "\n \n"
            + "Suggested Hotels for you to Book : "
            + "\n \n"
            + "Name : "
            + hotels["name"]
            + "\n \n"
            + "Link : "
            + hotels["link"]
            + "\n \n"
            + "Rating : "
            + str(hotels["rating"])
        )

        return final_response
    else:
        return response["choices"][0]["message"]["content"]

    
# Get Hotels Details
def get_hotel_details(city, startDate, endDate, guestQty):
    url = "https://best-booking-com-hotel.p.rapidapi.com/booking/best-accommodation"
    querystring = {"cityName":city,"countryName":"India"}
    headers = {
        # "X-RapidAPI-Key": rapid_api_key,
        "X-RapidAPI-Host": "best-booking-com-hotel.p.rapidapi.com"
    }
    response = requests.get(url, headers=headers, params=querystring)
    return response.json()