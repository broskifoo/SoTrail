from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from groq import Groq

router = APIRouter()

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Dict
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    should_update_search: bool = False

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Build system prompt with trip context
        system_prompt = f"""You are SoTrail AI, a helpful travel assistant. You're helping a user plan their trip.

Current Trip Details:
- Origin: {request.context.get('origin', 'Not specified')}
- Destination: {request.context.get('destination', 'Not specified')}
- Departure: {request.context.get('departureDate', 'Not specified')}
- Return: {request.context.get('returnDate', 'Not specified')}
- Budget: ₹{request.context.get('budget', 0):,}
- Travelers: {request.context.get('travelers', 1)}
- Trip Type: {request.context.get('tripType', 'domestic')}

Your role:
1. Provide helpful, accurate travel advice
2. Suggest itineraries, places to visit, local tips
3. Help with budget planning and cost breakdowns
4. Compare transport options (flights, trains, buses)
5. Recommend hotels and activities
6. Share weather info, best time to visit, and local customs
7. Be concise but informative
8. Use bullet points for lists
9. Include specific prices when discussing costs

Always be friendly, professional, and travel-focused."""

        # Build conversation messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 10 messages)
        for msg in request.conversation_history[-10:]:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.1-70b-versatile",
            temperature=0.7,
            max_tokens=1024,
            top_p=0.9,
            stream=False
        )

        response_text = chat_completion.choices[0].message.content

        # Determine if search should be updated
        should_update = any(keyword in request.message.lower() for keyword in [
            'update search', 'new search', 'change destination', 'different dates'
        ])

        return ChatResponse(
            response=response_text,
            should_update_search=should_update
        )

    except Exception as e:
        print(f"[ERROR] Chat API failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/health")
async def chat_health():
    return {
        "status": "healthy",
        "model": "llama-3.1-70b-versatile",
        "provider": "Groq"
    }
