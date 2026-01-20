\# SoTrail - AI-Powered Travel Planning Platform



A full-stack travel planning application with AI-powered recommendations, real-time flight and hotel search, and intelligent itinerary generation.



\## Features



\- AI Chatbot with RAG (Retrieval Augmented Generation)

\- Real-time Flight and Hotel Search via Amadeus API

\- Multi-modal Transport Options (Flights, Trains, Buses, Cabs)

\- AI Itinerary Generator using Llama 3.3 70B

\- Smart Analytics tracking searches and popular destinations

\- ChromaDB Vector Database for semantic search



\## Tech Stack



\### Backend

\- FastAPI (Python 3.12)

\- ChromaDB (Vector Database)

\- Groq API (Llama 3.3 70B)

\- Amadeus Travel API

\- Sentence Transformers



\### Frontend

\- Next.js 14

\- TypeScript

\- Tailwind CSS

\- React



\## Getting Started



\### Prerequisites

\- Python 3.12 or higher

\- Node.js 20 or higher

\- API Keys from:

&nbsp; - \[Amadeus Travel API](https://developers.amadeus.com/)

&nbsp; - \[Groq API](https://console.groq.com/)



\### Local Development



\*\*Backend Setup:\*\*

```bash

cd backend

python -m venv venv

venv\\Scripts\\activate

pip install -r requirements.txt

cp .env.example .env  # Add your API keys

python main.py



Frontend Setup:



bash

cd frontend

npm install

cp .env.example .env

npm run dev

Access the Application:



Frontend: http://localhost:3000



Backend API: http://localhost:8000



API Documentation: http://localhost:8000/docs



Project Structure



SoTrail/

├── backend/

│   ├── services/

│   │   ├── database.py          # ChromaDB integration

│   │   ├── rag\_service.py       # RAG implementation

│   │   └── trip\_agent.py        # Trip planning logic

│   ├── routes/

│   │   └── chat.py              # Chat endpoints

│   ├── main.py                  # FastAPI application

│   └── requirements.txt

├── frontend/

│   ├── app/

│   │   ├── page.tsx             # Home page

│   │   └── trip\_results/        # Results page

│   ├── components/

│   │   ├── ChatbotSidebar.tsx   # AI Chatbot interface

│   │   └── ItinerarySidebar.tsx # Itinerary display

│   └── package.json

├── data/

│   └── destinations/            # Travel guide documents for RAG

└── README.md



Key Features

RAG-Powered Chatbot

The chatbot uses Retrieval Augmented Generation to provide contextual travel recommendations. It leverages ChromaDB for vector storage and uses GPU-accelerated embeddings for fast semantic search across destination guides.



Real-time Search

Integration with Amadeus API provides live flight and hotel data with real pricing. The system searches across multiple sources to find the best options for flights, hotels, trains, buses, and cabs.



AI Itinerary Generator

Powered by Groq's Llama 3.3 70B model, the itinerary generator creates personalized day-by-day travel plans based on destination, duration, and user preferences.



Analytics Dashboard

Track search history, popular destinations, and user behavior to gain insights into travel trends.



API Endpoints

| Endpoint                | Method | Description                                 |

| ----------------------- | ------ | ------------------------------------------- |

| /api/search-all         | POST   | Search flights, hotels, trains, buses, cabs |

| /api/chat               | POST   | AI chatbot with RAG context                 |

| /api/generate-itinerary | POST   | Generate trip itinerary                     |

| /api/analytics          | GET    | Search analytics and insights               |



Technical Highlights

Production-ready FastAPI backend with async endpoints



RAG implementation using ChromaDB vector database



Real-time API integrations (Amadeus, Groq)



GPU optimization for embedding generation



Responsive UI built with Next.js and TypeScript



Type-safe API interactions



Deployment

This application can be deployed using Railway for the backend and Vercel for the frontend. Both platforms offer free tiers suitable for development and testing.



Contributing

Contributions are welcome. Please open an issue to discuss proposed changes or submit a pull request.



License

MIT License



Author

Aryendra Pandey



GitHub: @broskifoo



Project: SoTrail - AI Travel Planning Platform



Acknowledgments

Built with the following technologies and APIs:



Amadeus Travel API for flight and hotel data



Groq AI for LLM inference



ChromaDB for vector storage



Next.js for the frontend framework



FastAPI for the backend API

