from services.database import db
import json

print("\n" + "="*60)
print("CHROMADB DATA VIEWER")
print("="*60)

# Get recent searches
print("\n📊 RECENT SEARCHES:")
print("-"*60)
searches = db.get_recent_searches(20)
if searches:
    for i, search in enumerate(searches, 1):
        print(f"\n{i}. {search.get('origin')} → {search.get('destination')}")
        print(f"   Date: {search.get('departure_date')} to {search.get('return_date')}")
        print(f"   Travelers: {search.get('travelers')}")
        print(f"   Results: {search.get('flights_count')} flights, {search.get('hotels_count')} hotels, {search.get('trains_count')} trains")
        print(f"   Time: {search.get('timestamp')}")
else:
    print("No searches found yet!")

# Get popular destinations
print("\n\n🔥 POPULAR DESTINATIONS:")
print("-"*60)
popular = db.get_popular_destinations(10)
if popular:
    for i, dest in enumerate(popular, 1):
        print(f"{i}. {dest['_id']} - {dest['count']} searches")
else:
    print("No data yet!")

print("\n" + "="*60)
print(f"Total Searches: {len(searches)}")
print("="*60 + "\n")
