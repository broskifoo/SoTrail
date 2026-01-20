import chromadb
from sentence_transformers import SentenceTransformer

print("\n" + "="*50)
print("ChromaDB RAG Test")
print("="*50)

# Setup ChromaDB locally
client = chromadb.PersistentClient(path="D:/SoTrail/data/chromadb")
print("\nChromaDB initialized")

# Create collection
collection = client.get_or_create_collection(name="travel_destinations")
print("Collection ready")

# Sample destinations
destinations = [
    "Bali has amazing beaches for surfing. Seminyak, Uluwatu, and Canggu are must-visit spots.",
    "Tokyo mixes modern tech with old temples. Great street food and shopping in Shibuya.",
    "Paris has the Eiffel Tower, Louvre, and beautiful river cruises along the Seine.",
    "NYC never sleeps - Times Square, Central Park, endless food options from every culture."
]

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2', device='cuda')
print("Model loaded")

# Create embeddings
embeddings = model.encode(destinations)
print(f"Created embeddings for {len(destinations)} destinations")

# Store in ChromaDB
ids = [f"dest_{i}" for i in range(len(destinations))]
collection.add(
    embeddings=embeddings.tolist(),
    documents=destinations,
    ids=ids
)
print("Data stored in ChromaDB")

# Search test
query = "beaches for surfing"
query_emb = model.encode([query])

results = collection.query(
    query_embeddings=query_emb.tolist(),
    n_results=2
)

print("\n" + "="*50)
print(f"Search: '{query}'")
print("="*50)

for i, doc in enumerate(results['documents'][0], 1):
    print(f"\n{i}. {doc}")

print("\nTest passed!\n")
