from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from services.rag_service import RAGService
from services.trip_agent import TripPlanningAgent

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Setup
mongo_uri = os.getenv('MONGODB_URI')
db_name = os.getenv('DATABASE_NAME')
client = MongoClient(mongo_uri)
db = client[db_name]

# Initialize RAG and Agent
rag_service = RAGService()
rag_service.add_documents("D:/SoTrail/data/destinations")
trip_agent = TripPlanningAgent(rag_service)

@app.route('/api/plan-trip', methods=['POST'])
def plan_trip():
    try:
        data = request.json
        user_query = data.get('query')
        
        if not user_query:
            return jsonify({'error': 'Query is required'}), 400
        
        result = trip_agent.plan_trip(user_query)
        
        return jsonify({
            'success': True,
            'response': result['response'],
            'sources': result['sources']
        }), 200
        
    except Exception as e:
        print(f"Error in plan_trip: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
