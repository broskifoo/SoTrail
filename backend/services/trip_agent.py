from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from dotenv import load_dotenv
import os

load_dotenv()

class TripPlanningAgent:
    def __init__(self, rag_service):
        self.rag_service = rag_service
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in .env")
        
       
        self.llm = ChatGroq(temperature=0.7, model="llama-3.1-8b-instant", api_key=api_key)


        print("Trip Planning Agent initialized")
    
    def plan_trip(self, user_query):
        search_results = self.rag_service.search(user_query, n_results=3)
        context = "\n\n".join(search_results['documents'][0])
        
        system_prompt = """You are SoTrail, an expert travel planning assistant. 
Use the provided travel information to help users plan amazing trips.
Be specific with recommendations, mention prices, and suggest day-by-day itineraries."""
        
        user_prompt = f"""Travel Information:
{context}

User Question: {user_query}

Provide a helpful, detailed response based on the travel information above."""
        
        messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
        response = self.llm.invoke(messages)
        
        return {"response": response.content, "sources": search_results['ids'][0][:3]}

if __name__ == "__main__":
    from rag_service import RAGService
    
    print("\n" + "="*50)
    print("Trip Planning Agent Test")
    print("="*50)
    
    rag = RAGService()
    rag.add_documents("D:/SoTrail/data/destinations")
    agent = TripPlanningAgent(rag)
    
    query = "I want to plan a 7-day surf trip to Bali with $1500 budget"
    print(f"\nUser: {query}")
    print("-" * 50)
    result = agent.plan_trip(query)
    print(f"\nSoTrail: {result['response']}")
    print(f"\nSources: {result['sources']}")
