import chromadb
from chromadb.config import Settings
from datetime import datetime
import json

class Database:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path="D:/SoTrail/data/chromadb"
        )
        
        # Collections
        self.searches = self.client.get_or_create_collection("searches")
        self.favorites = self.client.get_or_create_collection("favorites")
        
        print("[SUCCESS] ChromaDB connected successfully")
    
    def save_search(self, search_data):
        """Save user search to database"""
        search_id = f"search_{datetime.utcnow().timestamp()}"
        
        search_record = {
            "origin": search_data.get("origin"),
            "destination": search_data.get("destination"),
            "departure_date": search_data.get("departureDate"),
            "return_date": search_data.get("returnDate"),
            "travelers": str(search_data.get("travelers")),
            "trip_type": search_data.get("tripType"),
            "timestamp": datetime.utcnow().isoformat(),
            "flights_count": str(search_data.get("flights_count", 0)),
            "hotels_count": str(search_data.get("hotels_count", 0)),
            "trains_count": str(search_data.get("trains_count", 0)),
            "buses_count": str(search_data.get("buses_count", 0)),
        }
        
        self.searches.add(
            ids=[search_id],
            metadatas=[search_record],
            documents=[f"{search_record['origin']} to {search_record['destination']}"]
        )
        
        return search_id
    
    def get_recent_searches(self, limit=10):
        """Get recent searches"""
        try:
            results = self.searches.get(limit=limit)
            searches = []
            
            if results and results['metadatas']:
                for metadata in results['metadatas']:
                    searches.append(metadata)
            
            return searches
        except Exception as e:
            print(f"[ERROR] Failed to get searches: {e}")
            return []
    
    def get_popular_destinations(self, limit=5):
        """Get most searched destinations"""
        try:
            results = self.searches.get()
            
            if not results or not results['metadatas']:
                return []
            
            # Count destinations
            dest_count = {}
            for metadata in results['metadatas']:
                dest = metadata.get('destination', 'Unknown')
                dest_count[dest] = dest_count.get(dest, 0) + 1
            
            # Sort by count
            popular = sorted(dest_count.items(), key=lambda x: x[1], reverse=True)[:limit]
            
            return [{"_id": dest, "count": count} for dest, count in popular]
        except Exception as e:
            print(f"[ERROR] Failed to get popular destinations: {e}")
            return []
    
    def save_favorite(self, user_id, item_type, item_data):
        """Save favorite flight/hotel/etc"""
        favorite_id = f"fav_{datetime.utcnow().timestamp()}"
        
        favorite = {
            "user_id": user_id,
            "item_type": item_type,
            "item_data": json.dumps(item_data),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.favorites.add(
            ids=[favorite_id],
            metadatas=[favorite],
            documents=[f"{item_type} favorite"]
        )
        
        return favorite_id
    
    def get_user_favorites(self, user_id):
        """Get user's favorites"""
        try:
            results = self.favorites.get()
            
            if not results or not results['metadatas']:
                return []
            
            user_favs = [
                metadata for metadata in results['metadatas']
                if metadata.get('user_id') == user_id
            ]
            
            return user_favs
        except Exception as e:
            print(f"[ERROR] Failed to get favorites: {e}")
            return []

# Global database instance
db = Database()
