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
                    "departure": {
                        "type": "string",
                        "description": "city from which trip ends",
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
                    "departure",
                    "trip start date",
                    "trip end date",
                    "trip budget",
                    "number of travelers",
                ],
            },
        }
    ]