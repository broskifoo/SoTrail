import chromadb
from sentence_transformers import SentenceTransformer
from pathlib import Path

class RAGService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="D:/SoTrail/data/chromadb")
        self.model = SentenceTransformer('all-MiniLM-L6-v2', device='cuda')
        self.collection = self.client.get_or_create_collection(name="travel_destinations")
        print("RAG Service initialized")
    
    def load_documents(self, folder_path):
        docs = []
        doc_names = []
        folder = Path(folder_path)
        for file_path in folder.glob("*.txt"):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                docs.append(content)
                doc_names.append(file_path.stem)
        print(f"Loaded {len(docs)} documents")
        return docs, doc_names
    
    def chunk_text(self, text, chunk_size=400, overlap=50):
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if len(chunk) > 50:
                chunks.append(chunk)
        return chunks
    
    def add_documents(self, folder_path):
        docs, doc_names = self.load_documents(folder_path)
        all_chunks = []
        all_ids = []
        chunk_sources = {}
        
        for doc, name in zip(docs, doc_names):
            chunks = self.chunk_text(doc)
            for i, chunk in enumerate(chunks):
                chunk_id = f"{name}_chunk_{i}"
                all_chunks.append(chunk)
                all_ids.append(chunk_id)
                chunk_sources[chunk_id] = name
        
        print(f"Created {len(all_chunks)} chunks")
        print("Generating embeddings on GPU...")
        embeddings = self.model.encode(all_chunks, show_progress_bar=True)
        
        print("Storing in ChromaDB...")
        self.collection.add(embeddings=embeddings.tolist(), documents=all_chunks, ids=all_ids)
        print(f"Stored {len(all_chunks)} chunks")
        self.chunk_sources = chunk_sources
        return chunk_sources
    
    def search(self, query, n_results=3):
        query_embedding = self.model.encode([query])
        results = self.collection.query(query_embeddings=query_embedding.tolist(), n_results=n_results)
        return results

if __name__ == "__main__":
    print("\n" + "="*50)
    print("RAG Service Test")
    print("="*50)
    
    rag = RAGService()
    sources = rag.add_documents("D:/SoTrail/data/destinations")
    
    print("\n" + "="*50)
    print("Search Test")
    print("="*50)
    
    queries = ["best beaches for surfing", "budget travel advice", "cherry blossom viewing"]
    
    for query in queries:
        print(f"\nQuery: '{query}'")
        print("-" * 50)
        results = rag.search(query, n_results=2)
        
        for i, (doc_id, doc) in enumerate(zip(results['ids'][0], results['documents'][0])):
            source = sources.get(doc_id, 'unknown').upper()
            print(f"\n{i+1}. Source: {source}")
            print(f"   {doc[:200]}...")
    
    print("\n" + "="*50)
    print("RAG Service Complete!")
    print("="*50)
