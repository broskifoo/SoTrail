from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from amadeus import Client, ResponseError
from groq import Groq
import airportsdata
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from datetime import datetime, timedelta
import json
from services.database import db


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    amadeus = Client(
        client_id=os.getenv("AMADEUS_API_KEY"),
        client_secret=os.getenv("AMADEUS_API_SECRET"),
    )
    print("[SUCCESS] Amadeus API initialized")
except Exception as e:
    print(f"[ERROR] Amadeus initialization failed: {e}")
    amadeus = None

try:
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    print("[SUCCESS] Groq AI initialized")
except Exception as e:
    print(f"[ERROR] Groq initialization failed: {e}")
    groq_client = None

airports = airportsdata.load("IATA")
geolocator = Nominatim(user_agent="sotrail_travel_app")


def find_nearest_airport(city_name: str) -> str:
    try:
        city_upper = city_name.upper()
        
        major_cities = {
            "MUMBAI": "BOM", "DELHI": "DEL", "BANGALORE": "BLR", 
            "BENGALURU": "BLR", "HYDERABAD": "HYD", "CHENNAI": "MAA",
            "KOLKATA": "CCU", "PUNE": "PNQ", "AHMEDABAD": "AMD",
            "GOA": "GOI", "JAIPUR": "JAI", "KOCHI": "COK", "COCHIN": "COK",
            "VARANASI": "VNS", "AMRITSAR": "ATQ", "LUCKNOW": "LKO",
            "SRINAGAR": "SXR", "LEH": "IXL", "AGRA": "AGR",
            "UDAIPUR": "UDR", "CHANDIGARH": "IXC", "BHUBANESWAR": "BBI"
        }
        
        for city_key, code in major_cities.items():
            if city_key in city_upper:
                print(f"[SUCCESS] Matched {city_name} to {code} via city mapping")
                return code
        
        location = geolocator.geocode(city_name, timeout=10)
        if not location:
            print(f"[WARNING] Could not locate: {city_name}, using default DEL")
            return "DEL"
        
        city_coords = (location.latitude, location.longitude)
        print(f"[INFO] Located {city_name} at coordinates: {city_coords}")
        
        nearest_airport = None
        min_distance = float("inf")
        
        for code, airport_data in airports.items():
            if len(code) != 3:
                continue
            airport_coords = (airport_data["lat"], airport_data["lon"])
            distance = geodesic(city_coords, airport_coords).kilometers
            
            if distance < min_distance:
                min_distance = distance
                nearest_airport = code
        
        print(f"[SUCCESS] Nearest airport to {city_name}: {nearest_airport} ({min_distance:.1f} km)")
        return nearest_airport
    except Exception as e:
        print(f"[ERROR] Airport search failed for {city_name}: {e}")
        return "DEL"


def calculate_distance(origin: str, destination: str) -> float:
    try:
        # Clean up location strings - remove state/country suffixes
        origin_clean = origin.split(',')[0].strip()
        dest_clean = destination.split(',')[0].strip()
        
        print(f"[INFO] Calculating distance: {origin_clean} to {dest_clean}")
        
        origin_loc = geolocator.geocode(origin_clean, timeout=10)
        dest_loc = geolocator.geocode(dest_clean, timeout=10)
        
        if origin_loc and dest_loc:
            distance = geodesic(
                (origin_loc.latitude, origin_loc.longitude),
                (dest_loc.latitude, dest_loc.longitude),
            ).kilometers
            print(f"[SUCCESS] Distance calculated: {distance:.1f} km")
            return distance
        
        print(f"[WARNING] Could not geocode locations")
        return 0.0
    except Exception as e:
        print(f"[ERROR] Distance calc failed: {e}")
        return 0.0



def get_country_from_location(location: str) -> str:
    try:
        loc = geolocator.geocode(location, addressdetails=True, timeout=10)
        if loc and loc.raw.get("address"):
            return loc.raw["address"].get("country", "").lower()
        return ""
    except Exception:
        return ""


def estimate_cab_options(origin: str, destination: str, country: str):
    distance_km = calculate_distance(origin, destination)
    print(f"[INFO] Cab distance: {distance_km:.1f} km")
    
    if distance_km == 0 or distance_km > 300:
        print("[INFO] Cabs not practical for this distance")
        return []
    
    if country in ["india", "nepal", "bangladesh", "sri lanka"]:
        rates = {
            "Economy Sedan (UberGo)": 12,
            "Premium Sedan (Uber Premier)": 18,
            "SUV (Uber XL)": 22
        }
        currency = "INR"
    else:
        rates = {
            "Standard Ride (UberX)": 25,
            "Comfort Sedan (Uber Comfort)": 35,
            "Premium SUV (Uber Black)": 50
        }
        currency = "USD"
    
    cabs = []
    for cab_type, per_km in rates.items():
        price = int(distance_km * per_km)
        hours = int(distance_km / 40)
        minutes = int(((distance_km / 40) - hours) * 60)
        
        if "Economy" in cab_type or "Standard" in cab_type:
            capacity = 4
        elif "SUV" in cab_type or "XL" in cab_type:
            capacity = 6
        else:
            capacity = 4
        
        cabs.append({
            "type": cab_type,
            "operator": "Uber",
            "price": price,
            "currency": currency,
            "duration": f"{hours}h {minutes}m",
            "capacity": capacity,
            "booking_link": None,
        })
    return cabs


def generate_train_data(origin: str, destination: str, departure_date: str):
    """Generate realistic train options based on route"""
    
    origin_city = origin.split(',')[0].strip()
    dest_city = destination.split(',')[0].strip()
    
    distance_km = calculate_distance(origin, destination)
    
    if distance_km == 0:
        return []
    
    avg_speed = 70
    travel_hours = int(distance_km / avg_speed)
    travel_minutes = int(((distance_km / avg_speed) - travel_hours) * 60)
    
    ac2_price_per_km = 2.5
    ac3_price_per_km = 1.8
    sleeper_price_per_km = 0.8
    
    trains = []
    
    train_templates = [
        {
            "name": f"{origin_city} - {dest_city} Express",
            "number": "12345",
            "departure": "06:00",
            "class": "AC 2-Tier",
            "price_multiplier": ac2_price_per_km
        },
        {
            "name": f"{dest_city} Superfast",
            "number": "12678",
            "departure": "14:30",
            "class": "AC 3-Tier",
            "price_multiplier": ac3_price_per_km
        },
        {
            "name": f"{origin_city} {dest_city} SF Express",
            "number": "22890",
            "departure": "22:15",
            "class": "Sleeper",
            "price_multiplier": sleeper_price_per_km
        }
    ]
    
    if distance_km > 500:
        train_templates.insert(0, {
            "name": f"{origin_city} Rajdhani",
            "number": "12301",
            "departure": "17:00",
            "class": "AC 2-Tier",
            "price_multiplier": ac2_price_per_km * 1.3
        })
    
    for template in train_templates:
        dep_hour, dep_min = map(int, template["departure"].split(':'))
        total_minutes = dep_hour * 60 + dep_min + (travel_hours * 60) + travel_minutes
        arr_hour = (total_minutes // 60) % 24
        arr_min = total_minutes % 60
        
        base_price = int(distance_km * template["price_multiplier"])
        
        trains.append({
            "train_name": template["name"],
            "train_number": template["number"],
            "departure_time": template["departure"],
            "arrival_time": f"{arr_hour:02d}:{arr_min:02d}",
            "duration": f"{travel_hours}h {travel_minutes}m",
            "price": base_price,
            "class_type": template["class"],
            "seats_available": 25 + (hash(template["name"]) % 50),
            "operator": "Indian Railways",
            "booking_link": "https://www.irctc.co.in",
        })
    
    return trains


def generate_bus_data(origin: str, destination: str, departure_date: str):
    """Generate realistic bus options with RedBus deep links"""
    
    distance_km = calculate_distance(origin, destination)
    
    if distance_km == 0 or distance_km < 50 or distance_km > 1000:
        print(f"[INFO] Buses not available for {distance_km:.1f} km distance")
        return []
    
    origin_city = origin.split(',')[0].strip().replace(' ', '-').lower()
    dest_city = destination.split(',')[0].strip().replace(' ', '-').lower()
    
    avg_speed = 45
    travel_hours = int(distance_km / avg_speed)
    travel_minutes = int(((distance_km / avg_speed) - travel_hours) * 60)
    
    buses = []
    
    bus_templates = [
        {
            "operator": "VRL Travels",
            "type": "Volvo Multi-Axle AC Sleeper",
            "departure": "21:30",
            "price_per_km": 1.4,
            "amenities": ["AC", "WiFi", "Blanket & Pillow", "Water Bottle", "Sleeper Berths"],
            "rating": 4.2
        },
        {
            "operator": "SRS Travels",
            "type": "AC Seater Push Back",
            "departure": "07:00",
            "price_per_km": 1.0,
            "amenities": ["AC", "Pushback Seats", "Charging Points", "Reading Light"],
            "rating": 4.0
        },
        {
            "operator": "IntrCity SmartBus",
            "type": "AC Sleeper (2+1)",
            "departure": "22:00",
            "price_per_km": 1.5,
            "amenities": ["AC", "WiFi", "Personal Entertainment", "Snacks", "USB Charging"],
            "rating": 4.4
        },
        {
            "operator": "RedBus Prime",
            "type": "Volvo AC Sleeper",
            "departure": "23:00",
            "price_per_km": 1.3,
            "amenities": ["AC", "WiFi", "Blanket", "Water Bottle", "GPS Tracking"],
            "rating": 4.3
        },
        {
            "operator": "Orange Travels",
            "type": "AC Seater",
            "departure": "08:30",
            "price_per_km": 0.9,
            "amenities": ["AC", "Charging Points", "Water Bottle"],
            "rating": 3.8
        },
        {
            "operator": "Neeta Travels",
            "type": "Volvo Multi-Axle Sleeper",
            "departure": "20:00",
            "price_per_km": 1.2,
            "amenities": ["AC", "WiFi", "Blanket & Pillow", "Emergency Exit"],
            "rating": 4.1
        }
    ]
    
    for template in bus_templates:
        dep_hour, dep_min = map(int, template["departure"].split(':'))
        total_minutes = dep_hour * 60 + dep_min + (travel_hours * 60) + travel_minutes
        arr_hour = (total_minutes // 60) % 24
        arr_min = total_minutes % 60
        
        base_price = int(distance_km * template["price_per_km"])
        
        dep_date = datetime.strptime(departure_date, "%Y-%m-%d")
        if dep_date.weekday() >= 5:
            base_price = int(base_price * 1.1)
        
        seats = 18 + (hash(template["operator"] + departure_date) % 23)
        
        redbus_link = f"https://www.redbus.in/bus-tickets/{origin_city}-to-{dest_city}"
        
        buses.append({
            "operator": template["operator"],
            "bus_type": template["type"],
            "departure_time": template["departure"],
            "arrival_time": f"{arr_hour:02d}:{arr_min:02d}",
            "duration": f"{travel_hours}h {travel_minutes}m",
            "price": base_price,
            "seats_available": seats,
            "amenities": template["amenities"],
            "rating": template["rating"],
            "booking_link": redbus_link,
        })
    
    print(f"[SUCCESS] Generated {len(buses)} bus options for {origin_city} to {dest_city}")
    return buses


class SearchAllRequest(BaseModel):
    origin: str
    destination: str
    departureDate: str
    departureTime: str
    returnDate: str
    returnTime: str
    travelers: int
    tripType: str


class ChatRequest(BaseModel):
    message: str
    context: dict


class ItineraryRequest(BaseModel):
    origin: str
    destination: str
    departureDate: str
    returnDate: str
    travelers: int
    selectedFlight: Optional[dict] = None
    selectedHotel: Optional[dict] = None


@app.post("/api/search-all")
async def search_all(request: SearchAllRequest):
    print(f"\n[INFO] Searching: {request.origin} to {request.destination}")
    
    try:
        origin_code = find_nearest_airport(request.origin)
        dest_code = find_nearest_airport(request.destination)
        print(f"[INFO] Airport codes: {origin_code} to {dest_code}")
        
        flights = []
        hotels = []
        trains = []
        buses = []
        cabs = []
        
        # FLIGHTS
        if amadeus:
            try:
                print("[INFO] Querying Amadeus for flights")
                flight_response = amadeus.shopping.flight_offers_search.get(
                    originLocationCode=origin_code,
                    destinationLocationCode=dest_code,
                    departureDate=request.departureDate,
                    returnDate=request.returnDate,
                    adults=request.travelers,
                    currencyCode="INR",
                    max=15,
                )
                
                for offer in flight_response.data:
                    itinerary = offer["itineraries"][0]
                    segments = itinerary["segments"]
                    first_segment = segments[0]
                    last_segment = segments[-1]
                    
                    departure_time = first_segment["departure"]["at"].split("T")[1][:5]
                    arrival_time = last_segment["arrival"]["at"].split("T")[1][:5]
                    duration = itinerary["duration"].replace("PT", "").replace("H", "h ").replace("M", "m")
                    
                    flights.append({
                        "airline": first_segment.get("carrierCode", "Airline"),
                        "flight_number": f"{first_segment['carrierCode']}-{first_segment['number']}",
                        "departure_time": departure_time,
                        "arrival_time": arrival_time,
                        "departure_airport": first_segment["departure"]["iataCode"],
                        "arrival_airport": last_segment["arrival"]["iataCode"],
                        "duration": duration,
                        "price": float(offer["price"]["total"]),
                        "stops": len(segments) - 1,
                        "class_type": first_segment.get("cabin", "Economy"),
                        "baggage_allowance": "15kg",
                        "booking_link": "https://www.google.com/travel/flights",
                    })
                
                print(f"[SUCCESS] Retrieved {len(flights)} flights")
            except Exception as e:
                print(f"[ERROR] Flight search failed: {e}")
        
        # HOTELS - SHOW ALL WITH AND WITHOUT OFFERS
        if amadeus:
            try:
                print("[INFO] Querying Amadeus for hotels")
                
                hotel_list = amadeus.reference_data.locations.hotels.by_city.get(cityCode=dest_code)
                all_hotels_data = hotel_list.data[:50]
                print(f"[INFO] Found {len(all_hotels_data)} hotels in {dest_code}")
                
                hotel_ids = [hotel["hotelId"] for hotel in all_hotels_data]
                hotels_with_offers = {}
                
                if hotel_ids:
                    try:
                        offers_response = amadeus.shopping.hotel_offers_search.get(
                            hotelIds=",".join(hotel_ids),
                            checkInDate=request.departureDate,
                            checkOutDate=request.returnDate,
                            adults=request.travelers,
                            currency="INR",
                        )
                        
                        for hotel_offer in offers_response.data:
                            hotel_id = hotel_offer.get("hotel", {}).get("hotelId")
                            if hotel_id:
                                hotels_with_offers[hotel_id] = hotel_offer
                        
                        print(f"[INFO] {len(hotels_with_offers)} hotels have pricing available")
                    except Exception as e:
                        print(f"[WARNING] Offers search failed: {e}")
                
                checkin = datetime.strptime(request.departureDate, "%Y-%m-%d")
                checkout = datetime.strptime(request.returnDate, "%Y-%m-%d")
                nights = (checkout - checkin).days or 1
                
                for hotel_info in all_hotels_data[:25]:
                    hotel_id = hotel_info.get("hotelId")
                    hotel_name = hotel_info.get("name", "Hotel")
                    
                    if hotel_id in hotels_with_offers:
                        hotel_offer = hotels_with_offers[hotel_id]
                        hotel_data = hotel_offer.get("hotel", {})
                        offers = hotel_offer.get("offers", [])
                        
                        if offers:
                            offer = offers[0]
                            price_info = offer.get("price", {})
                            total_price = float(price_info.get("total", 0))
                            price_per_night = total_price / nights
                            
                            room_type = offer.get("room", {}).get("typeEstimated", {}).get("category", "Standard Room")
                            
                            hotels.append({
                                "name": hotel_name,
                                "rating": 4,
                                "price_per_night": round(price_per_night, 2),
                                "total_price": round(total_price, 2),
                                "amenities": ["WiFi", "Air Conditioning", "Room Service", room_type],
                                "distance_from_center": "City Center",
                                "address": hotel_name,
                                "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"],
                                "booking_link": "https://www.booking.com",
                            })
                    else:
                        base_price = 3000
                        rating = 3
                        amenities = ["WiFi", "Air Conditioning"]
                        
                        name_lower = hotel_name.lower()
                        if any(word in name_lower for word in ["taj", "oberoi", "itc", "ritz", "four seasons", "st regis"]):
                            base_price = 15000
                            rating = 5
                            amenities = ["Free WiFi", "Spa", "Pool", "Fine Dining", "Concierge", "Valet"]
                        elif any(word in name_lower for word in ["marriott", "hyatt", "hilton", "radisson", "westin", "sheraton"]):
                            base_price = 8000
                            rating = 4
                            amenities = ["Free WiFi", "Pool", "Gym", "Restaurant", "Business Center"]
                        elif any(word in name_lower for word in ["luxury", "palace", "grand", "royal"]):
                            base_price = 10000
                            rating = 5
                            amenities = ["Free WiFi", "Spa", "Pool", "Fine Dining", "Butler Service"]
                        elif any(word in name_lower for word in ["boutique", "premium", "suites"]):
                            base_price = 5500
                            rating = 4
                            amenities = ["Free WiFi", "Breakfast", "Gym", "Rooftop"]
                        elif any(word in name_lower for word in ["resort", "spa"]):
                            base_price = 7000
                            rating = 4
                            amenities = ["Free WiFi", "Spa", "Pool", "Activities"]
                        elif any(word in name_lower for word in ["budget", "inn", "lodge", "guesthouse", "hostel"]):
                            base_price = 1500
                            rating = 2
                            amenities = ["WiFi", "24/7 Reception"]
                        
                        total_price = base_price * nights
                        
                        hotels.append({
                            "name": hotel_name,
                            "rating": rating,
                            "price_per_night": round(base_price, 2),
                            "total_price": round(total_price, 2),
                            "amenities": amenities,
                            "distance_from_center": "City Center",
                            "address": hotel_name,
                            "images": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"],
                            "booking_link": "https://www.booking.com",
                        })
                
                print(f"[SUCCESS] Retrieved {len(hotels)} hotels total ({len(hotels_with_offers)} with real Amadeus prices, {len(hotels) - len(hotels_with_offers)} estimated)")
                
            except Exception as e:
                print(f"[ERROR] Hotel search failed: {e}")
        
        # TRAINS
        if request.tripType == "domestic":
            trains = generate_train_data(request.origin, request.destination, request.departureDate)
            print(f"[SUCCESS] Generated {len(trains)} train options")
        
        # BUSES
        if request.tripType == "domestic":
            buses = generate_bus_data(request.origin, request.destination, request.departureDate)
            print(f"[SUCCESS] Generated {len(buses)} bus options")
        
        # CABS
        origin_country = get_country_from_location(request.origin)
        cabs = estimate_cab_options(request.origin, request.destination, origin_country)
        
        # COORDS
        origin_loc = geolocator.geocode(request.origin, timeout=10)
        dest_loc = geolocator.geocode(request.destination, timeout=10)
        
        origin_coords = {"lat": origin_loc.latitude, "lng": origin_loc.longitude} if origin_loc else None
        dest_coords = {"lat": dest_loc.latitude, "lng": dest_loc.longitude} if dest_loc else None
        
               # SUMMARY
        all_transport = flights + trains + cabs
        cheapest = min(all_transport, key=lambda x: x["price"]) if all_transport else None
        fastest = min(flights, key=lambda x: float(x["duration"].replace("h", ".").replace("m", "").split()[0])) if flights else None
        
        summary = {
            "cheapest_option": f"{cheapest.get('airline', cheapest.get('train_name', cheapest.get('operator', 'N/A')))} (Rs {cheapest['price']:,.0f})" if cheapest else "N/A",
            "fastest_option": f"Flight ({fastest['duration']})" if fastest else "N/A",
            "recommended": flights[0]["airline"] if flights else trains[0]["train_name"] if trains else "Check options",
        }
        
        # Log search to database (ADD THIS SECTION HERE)
        try:
            db.save_search({
                "origin": request.origin,
                "destination": request.destination,
                "departureDate": request.departureDate,
                "returnDate": request.returnDate,
                "travelers": request.travelers,
                "tripType": request.tripType,
                "flights_count": len(flights),
                "hotels_count": len(hotels),
                "trains_count": len(trains),
                "buses_count": len(buses),
            })
            print("[SUCCESS] Search logged to database")
        except Exception as e:
            print(f"[WARNING] Failed to log search: {e}")
        
        return {
            "flights": flights,
            "trains": trains,
            "buses": buses,
            "hotels": hotels,
            "cabs": cabs,
            "summary": summary,
            "coords": {"origin": origin_coords, "destination": dest_coords},
        }

    
    except Exception as e:
        print(f"[ERROR] Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print("\n[INFO] Processing chat message")
    
    try:
        if not groq_client:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"You are SoTrail AI, a helpful travel planning assistant. The user is planning a trip from {request.context.get('origin')} to {request.context.get('destination')}. Provide concise travel advice."},
                {"role": "user", "content": request.message},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        
        response_text = completion.choices[0].message.content
        print("[SUCCESS] Generated AI response")
        
        return {"response": response_text, "should_update_search": False}
    
    except Exception as e:
        print(f"[ERROR] Chat processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-itinerary")
async def generate_itinerary(request: ItineraryRequest):
    print(f"\n[INFO] Generating itinerary for {request.origin} to {request.destination}")
    
    try:
        start_date = datetime.strptime(request.departureDate, "%Y-%m-%d")
        end_date = datetime.strptime(request.returnDate, "%Y-%m-%d")
        days_count = max(1, (end_date - start_date).days)
        
        if groq_client:
            try:
                prompt = f"""Create a detailed day-by-day travel itinerary for a {days_count}-day trip from {request.origin} to {request.destination}.

Trip Details:
- Dates: {request.departureDate} to {request.returnDate}
- Travelers: {request.travelers}

Generate a realistic itinerary with daily activities, meal suggestions, and timing.

Respond ONLY with valid JSON in this exact format:
{{
  "days": [
    {{
      "day": 1,
      "date": "{start_date.strftime('%a, %b %d, %Y')}",
      "title": "Arrival in {request.destination}",
      "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4", "Activity 5"]
    }}
  ]
}}"""
                
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a professional travel planner. Generate practical, realistic itineraries in JSON format only."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.7,
                    max_tokens=2000,
                )
                
                response_text = completion.choices[0].message.content.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                response_text = response_text.strip()
                
                itinerary_data = json.loads(response_text)
                print(f"[SUCCESS] Generated AI itinerary with {len(itinerary_data['days'])} days")
                
                return {
                    "itinerary": {
                        **itinerary_data,
                        "transportation": request.selectedFlight,
                        "accommodation": request.selectedHotel,
                    }
                }
            
            except Exception as ai_error:
                print(f"[WARNING] AI itinerary generation failed: {ai_error}")
        
        days = []
        for i in range(days_count):
            current = start_date + timedelta(days=i)
            if i == 0:
                days.append({
                    "day": 1,
                    "date": current.strftime("%a, %b %d, %Y"),
                    "title": f"Arrival in {request.destination}",
                    "activities": ["Airport pickup and transfer to hotel", "Hotel check-in and freshen up", "Rest and recover from journey", "Evening local area walk", "Dinner at hotel or nearby restaurant"],
                })
            elif i == days_count - 1:
                days.append({
                    "day": i + 1,
                    "date": current.strftime("%a, %b %d, %Y"),
                    "title": f"Departure from {request.destination}",
                    "activities": ["Hotel checkout and packing", "Last-minute shopping", "Airport transfer", f"Flight back to {request.origin}"],
                })
            else:
                days.append({
                    "day": i + 1,
                    "date": current.strftime("%a, %b %d, %Y"),
                    "title": f"Explore {request.destination}",
                    "activities": ["Breakfast at hotel", "Visit major attractions", "Lunch at local restaurant", "Shopping and sightseeing", "Evening entertainment", "Dinner and return to hotel"],
                })
        
        print(f"[SUCCESS] Generated fallback itinerary with {len(days)} days")
        
        return {
            "itinerary": {
                "days": days,
                "transportation": request.selectedFlight,
                "accommodation": request.selectedHotel,
            }
        }
    
    except Exception as e:
        print(f"[ERROR] Itinerary generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics")
async def get_analytics():
    """Get search analytics"""
    try:
        recent_searches = db.get_recent_searches(10)
        popular_destinations = db.get_popular_destinations(5)
        
        # Convert ObjectId to string for JSON serialization
        for search in recent_searches:
            search['_id'] = str(search['_id'])
        
        return {
            "recent_searches": recent_searches,
            "popular_destinations": popular_destinations
        }
    except Exception as e:
        print(f"[ERROR] Analytics failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 60)
    print("SoTrail API - Travel Planning Platform")
    print("=" * 60)
    print(f"Amadeus API: {'Ready' if amadeus else 'Not configured'}")
    print(f"Groq AI: {'Ready' if groq_client else 'Not configured'}")
    print(f"Airport Database: {len(airports)} airports loaded")
    print("=" * 60)
    print("Server running at: http://localhost:8000")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
