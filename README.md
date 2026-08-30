# PaperMind AI — RAG Research Assistant

PaperMind AI is an AI-powered Research Intelligence Platform designed to transform academic research papers (PDFs) into interactive learning experiences. It includes a modular, robust **Retrieval-Augmented Generation (RAG)** chatbot pipeline that allows students and researchers to ask complex questions scoped to their documents and receive grounded answers complete with page-specific citations.

---

## 1. Problem Statement

Reading and digesting lengthy scientific research papers can be overwhelming. Standard language models (LLMs) suffer from hallucinations and lack specific, page-level grounding when discussing complex paper methodology, datasets, or mathematical equations. PaperMind AI addresses this by providing a context-constrained, cited AI Tutor sidebar that indexes PDF content into vector embeddings for precise page-level semantic search.

---

## 2. RAG Architecture Diagram

Below is the execution flow of the RAG pipeline when a user queries the chatbot:

```text
User Question
      ↓
Convert to Embedding (Google gemini-embedding-001, truncated to EMBEDDING_DIM)
      ↓
Semantic Search Vector DB (Qdrant) with cosine similarity
      ↓
[Filter Results by relevance score >= SIMILARITY_THRESHOLD]
      ↓
Retrieve Top K Chunks (with document name, page number, chunk ID, similarity score)
      ↓
Construct Context-Rich Prompt (with system prompt rules)
      ↓
Call LLM (Google Gemini 3.5 Flash)
      ↓
Generate Grounded Answer + Source citations list
      ↓
Display to React UI with interactive jump-to-page citation badges
```

And here is the document ingestion pipeline when a PDF is uploaded:

```text
User Uploads PDF
      ↓
Parse text page-by-page (pdf-parse custom pagerenderer)
      ↓
Text Cleaning (whitespace normalization)
      ↓
Sliding Window Chunking (character limit: CHUNK_SIZE, overlap: CHUNK_OVERLAP)
      ↓
Generate Vector Embeddings (gemini-embedding-001)
      ↓
Index vectors & metadata payload in Qdrant (auto-recreates collection if dimension changes)
      ↓
Save paper metadata and chunks to MongoDB
```

---

## 3. Technology Stack & AI/ML Models

- **Frontend:** React, TailwindCSS (v4), Lucide React
- **Backend:** Node.js, Express, Mongoose
- **Databases:** MongoDB (Metadata & Fallback Store), Qdrant (Vector Database)
- **Embedding Model:** `gemini-embedding-001` (Configurable dimension via `EMBEDDING_DIM` using Matryoshka Representation Learning) via Google Gen AI API
- **LLM Model:** `gemini-3.5-flash` via Google Gen AI API

---

## 4. Key Features & Strategies

### Document Ingestion & Chunking
- **Page-Preserving Parser:** Uses `pdf-parse` with a custom `pagerender` function to extract text page-by-page. This ensures every text chunk is mapped to its exact physical page number for reliable citations.
- **Sliding Window Chunker:** Splits text into uniform segments (default: `CHUNK_SIZE=1000` characters) with configurable overlap (`CHUNK_OVERLAP=200` characters) to prevent loss of context across boundaries.
- **Duplicate Verification:** Restricts files with duplicate titles to avoid indexing redundant document collections.

### Retrieval & Grounding
- **Strict PDF Mode:** Similarity searches inside Qdrant are automatically filtered using a `paper_id` attribute, preventing data contamination from other papers when reading.
- **Relevance Thresholding:** Chunks with cosine similarity score below `0.3` are discarded to ensure only highly relevant data enters the context.
### PRIMARY RAG RETRIEVAL vs OFFLINE FALLBACK RETRIEVAL
- **PRIMARY RAG RETRIEVAL (Embeddings + Qdrant):** The production pipeline generates real vector embeddings from the user's query using the configured Gemini embedding model (`gemini-embedding-001`). It runs a similarity search over the Qdrant index, filtering results to the specific `paper_id` if in strict mode and throwing out chunks with a cosine score below `SIMILARITY_THRESHOLD`. The top results are structured with the document title, page number, chunk ID, and similarity score.
- **OFFLINE FALLBACK RETRIEVAL (Word Overlap):** If Qdrant is unavailable or the live API keys are missing, the system uses a fallback keyword-overlap Jaccard similarity scorer over localized text chunks loaded from MongoDB or in-memory fallback store. This allows offline demonstration and resilience testing.
- **Dynamic Collection Resizing:** The Qdrant initialization checks if the existing vector dimension size of the collection matches `EMBEDDING_DIM`. If you change your model configuration or size, the backend automatically detects it, deletes the stale collection, and recreates it with the correct dimensions.
- **Upload Validation & Security:** PDF uploads are restricted to `application/pdf` format and a file size limit of 10MB to prevent malicious uploads or Denial of Service attacks.

### Source Citation Approach
- The backend parses the retrieved chunks and separates the generated LLM text from metadata, returning a clean response schema including document details and similarity scores:
```json
{
  "success": true,
  "sender": "assistant",
  "content": "...generated response...",
  "citations": [
    {
      "chunk_id": "...",
      "page_number": 3,
      "section_name": "Methodology",
      "document_name": "Attention Is All You Need",
      "similarity_score": 0.895,
      "snippet": "..."
    }
  ]
}
```

---

## 5. System Directory Structure

```text
PROJ/
├── client/                      # React Frontend App (Vite)
│   ├── src/
│   │   ├── components/          # Sidebar, Chat, PDF Viewer, MindMap UI
│   │   └── pages/               # Workspace, Dashboard, Auth pages
│   └── Dockerfile               # Production static server build
├── server/                      # Node.js Express API Backend
│   ├── config/                  # Configuration & DB startup logic
│   ├── controllers/             # Express Route controllers (RAG hooked)
│   ├── models/                  # Mongoose MongoDB schemas
│   ├── prompts/                 # RAG LLM System instruction templates
│   ├── rag/                     # Core RAG pipeline modules
│   │   ├── chunking/            # Text splitting and cleaning
│   │   ├── embeddings/          # Google AI Studio Embeddings
│   │   ├── evaluation/          # RAG Evaluation script
│   │   ├── pipeline/            # RAG flow orchestrator
│   │   └── retrieval/           # Qdrant client connector
│   ├── tests/                   # Integration test runner
│   ├── package.json             # NPM package scripts & packages
│   └── Dockerfile               # Node API server runner
└── docker-compose.yml           # Multicontainer orchestration compose file
```

---

## 6. Configuration & Environment Variables

Create a `.env` file in the `server` directory. The variables are:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Express port | `5000` |
| `MONGODB_URI` | MongoDB Connection URI | `mongodb://127.0.0.1:27017/papermind` |
| `QDRANT_URL` | Qdrant Service Endpoint | `http://127.0.0.1:6333` |
| `GEMINI_API_KEY` | Google Gemini AI Key | *(Required for live RAG)* |
| `GEMINI_MODEL` | Text generation LLM model | `gemini-3.5-flash` |
| `EMBEDDING_MODEL` | Embedding generator model | `gemini-embedding-001` |
| `EMBEDDING_DIM` | Truncation output dimension size | `768` |
| `CHUNK_SIZE` | Max character length of chunk | `1000` |
| `CHUNK_OVERLAP` | Character overlap between chunks | `200` |
| `TOP_K` | Number of chunks sent to context | `5` |
| `SIMILARITY_THRESHOLD` | Cosine similarity limit | `0.3` |

---

## 7. Setup & Execution Commands

### A. Quick Start (Single Command Runner)
You can install dependencies and run both the frontend and backend simultaneously using the unified commands from the root directory:

1. **Setup environment:**
   ```bash
   cd server
   cp .env.example .env
   # Add your GEMINI_API_KEY inside the .env file
   cd ..
   ```
2. **Install all dependencies (Frontend & Backend):**
   ```bash
   npm run install:all
   ```
3. **Start both servers concurrently:**
   ```bash
   npm run dev
   # Runs backend on http://localhost:5000 and frontend on http://localhost:5173
   ```

---

### B. Manual Local Execution (Separate Terminals)
To launch PaperMind AI by running frontend and backend in separate terminals:

1. **Setup Environment:**
   ```bash
   cd server
   cp .env.example .env
   # Add your GEMINI_API_KEY inside the .env file
   ```
2. **Install & Run Backend:**
   ```bash
   npm install
   npm run dev
   # Runs on http://localhost:5000
   ```
3. **Install & Run Frontend:**
   ```bash
   cd ../client
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

---

## 8. Dockerization & Compose Setup

PaperMind AI is fully containerized. To spin up the entire application stack:

```bash
# Build all Docker containers
docker compose build

# Start services (frontend, backend, Qdrant, MongoDB) in background
docker compose up -d

# View status
docker compose ps
```
The services will map as follows:
- **PaperMind UI:** `http://localhost:5173`
- **Express API Backend:** `http://localhost:5000`
- **Qdrant Dashboard:** `http://localhost:6333/dashboard`

---

## 9. Testing & Evaluation

### Integration Tests
Run integration tests for configuration, PDF chunking, embedding dimension correctness, fallback keyword retrieval, and out-of-domain answers:
```bash
cd server
npm run test:rag
```

### Real Integration Test (Live Gemini & Qdrant)
To run a strict, mock-free integration test using live PDF extraction, real Gemini embeddings, and Qdrant indexing:
```bash
cd server
npm run test:real
```

### Docker Compose End-to-End Verification
To verify the complete Docker Compose container deployment, run:
```bash
cd server
node tests/docker_e2e_verify.js
```

### RAG Evaluation Module
To evaluate context retrieval Hit@K, Retrieval Recall, and generation groundedness scores:
```bash
cd server
npm run evaluate
```

---

## 10. Docker Hub Instructions

To push the PaperMind AI containers to Docker Hub, execute the following commands:

```bash
# 1. Login to Docker Hub
docker login -u <your-username>

# 2. Tag backend & frontend images
docker tag papermind-backend:latest <your-username>/papermind-backend:latest
docker tag papermind-backend:latest <your-username>/papermind-backend:v1.0.0
docker tag papermind-client:latest <your-username>/papermind-client:latest
docker tag papermind-client:latest <your-username>/papermind-client:v1.0.0

# 3. Push to registry
docker push <your-username>/papermind-backend:latest
docker push <your-username>/papermind-backend:v1.0.0
docker push <your-username>/papermind-client:latest
docker push <your-username>/papermind-client:v1.0.0
```

---

## 11. Known Limitations & Technical Decisions
- **OCR Support:** Image-only or scanned PDF documents do not contain text metadata and will trigger an ingestion error instead of silently returning empty strings.
- **In-Memory database Fallback:** Mongoose will automatically fall back to memoryStore data mapping if no active MongoDB database connection can be established.
- **Offline RAG Mocking:** If no Gemini API Key is configured, pseudo-random deterministic vector dimensions and context matching are simulated.
