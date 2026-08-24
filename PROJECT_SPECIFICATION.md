# Project Specification: PaperMind AI

PaperMind AI is an AI-powered Research Intelligence Platform designed to transform academic research papers (PDFs) into interactive, multi-dimensional learning experiences. By extracting structured data, generating knowledge graphs, constructing interactive mind maps, and deploying adaptive tutoring agents, PaperMind AI helps researchers, students, and professionals digest complex papers efficiently.

---

## 1. Software Requirements Specification (SRS)

### 1.1 Scope and Objectives
The platform acts as a digital research companion. It aims to solve the problem of information overload in academia and R&D by:
*   Extracting key insights, entities, and citations from PDFs.
*   Generating interactive visuals (Knowledge Graphs, Mind Maps, and Diagrams) from text.
*   Providing an adaptive self-assessment loop (Flashcards, Quiz Engine).
*   Enabling contextual conversational study via an AI Research Tutor.

### 1.2 User Roles & Persona
1.  **Learner / Student:** Focuses on reading comprehension, flashcard memorisation, and test preparation via quizzes.
2.  **Researcher / Academic:** Focuses on structural linkages, citation tracking, similar paper discovery, and high-level knowledge synthesis.
3.  **Administrator:** Monitors usage metrics, vector storage metrics, API cost analytics, and manages users.

### 1.3 Core Features & Requirements

#### Core-1: Intelligent PDF Parsing
*   **FR-1.1:** The system must accept PDF uploads (up to 50MB) and extract raw text, metadata (title, authors, journal, DOI), headers, figures, and reference lists.
*   **FR-1.2:** The backend must run section-based chunking (e.g., Abstract, Methodology, Results, Discussion) and create semantic embeddings.

#### Core-2: AI-Powered Explanations
*   **FR-2.1:** Users must be able to highlight text in the PDF viewer to request contextual explanations (Simplify, Elaborate, Translate, or Code Example).

#### Core-3: Interactive Diagrams & Visuals
*   **FR-3.1:** The system must parse flowcharts or process descriptions inside the paper and represent them as dynamic SVG/Mermaid flowcharts.

#### Core-4: Knowledge Graph & Mind Maps
*   **FR-4.1:** The system must extract entities (methods, datasets, findings, theories) and relations from the document.
*   **FR-4.2:** Users must be able to view and interact with a visual Knowledge Graph (cross-paper relationships) and a hierarchical Mind Map (single-paper breakdown) using node-link visualizations.

#### Core-5: Flashcards & Quiz Engine
*   **FR-5.1:** The system must automatically generate QA flashcards based on key concepts.
*   **FR-5.2:** The Adaptive Quiz Engine must generate multiple-choice, true/false, and open-ended questions, adapting difficulty based on user performance.

#### Core-6: AI Research Tutor
*   **FR-6.1:** An LLM-powered chat sidebar must support conversational queries scoped strictly to the document contents (using RAG) or general research concepts.

#### Core-7: Recommendations & Citation Intelligence
*   **FR-7.1:** The system must parse the bibliography, map citation weight/relevance, and recommend similar papers using semantic search.

### 1.4 Non-Functional Requirements
*   **Performance (Latency):** PDF processing and embedding generation must complete in under 30 seconds for a standard 15-page paper. Conversational chat must stream tokens with initial latency under 1.5 seconds.
*   **Scalability:** The database and vector index must support rapid querying over millions of document chunks.
*   **Accuracy (Hallucination Control):** RAG search prompts must enforce citations referencing specific pages or sections of the PDF.

---

## 2. System Architecture

PaperMind AI is built using a modern decoupled architecture consisting of an interactive single-page application (SPA), a high-performance Python API, an asynchronous worker queue for document ingestion, and specialized relational, graph, and vector databases.

```mermaid
graph TD
    %% Client layer
    subgraph Client Tier (Next.js SPA)
        UI[Interactive UI Engine]
        PDFV[Interactive PDF Viewer]
        Flow[React Flow Graph Renderer]
    end

    %% Gateway / Auth / Router
    subgraph API Gateway / Load Balancer
        GW[Nginx / Reverse Proxy]
    end
    UI -->|HTTPS / WSS| GW
    PDFV -->|HTTPS| GW

    %% Backend Services
    subgraph Core Backend Tier (FastAPI)
        API[FastAPI Server]
        RAG[RAG & Embedding Coordinator]
        Tutor[Tutor Agent & WebSocket Server]
    end
    GW --> API

    %% Async Worker Tier
    subgraph Async Processing Tier
        Queue[Redis Queue]
        Workers[Celery Ingestion Workers]
    end
    API -->|Submit PDF Job| Queue
    Queue --> Workers

    %% Parser & LLM Services
    subgraph Parsing & Inference Tier
        Parser[PyMuPDF / Grobid Parsing Service]
        LLM[LLM API Provider: OpenAI/Claude]
    end
    Workers -->|Parse PDF structure| Parser
    Workers -->|Create Embeddings & Summaries| LLM
    Tutor -->|Query Chat Context| LLM
    RAG -->|Semantic Query| LLM

    %% Data Tier
    subgraph Storage Tier
        DB[(PostgreSQL: User, History, Quizzes)]
        VectorDB[(Qdrant / pgvector: Paper Embeddings)]
        GraphDB[(Neo4j: Knowledge Graph Entities)]
    end
    API --> DB
    Workers --> DB
    Workers --> VectorDB
    Workers --> GraphDB
    RAG --> VectorDB
    Tutor --> DB
    Flow --> GraphDB
```

---

## 3. Database Schema

### 3.1 Relational Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Papers Table (Metadata)
CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    authors TEXT[],
    journal VARCHAR(255),
    doi VARCHAR(100) UNIQUE,
    publication_year INTEGER,
    pdf_url VARCHAR(512) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- PDF Document Chunks (for mapping highlights and pages)
CREATE TABLE paper_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    bbox JSONB -- Bounding boxes for highlight coordinates in PDF
);

-- Flashcards Table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    box_level INTEGER DEFAULT 1, -- Leitner system spacing level
    next_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Questions Table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB, -- Array of choices: ["A", "B", "C", "D"]
    correct_option VARCHAR(10) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium'
);

-- Tutor Chat Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(10) CHECK (sender IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    citations JSONB, -- Link references to paper chunks: [{chunk_id, page}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning History / Analytics
CREATE TABLE learning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'chat', 'quiz_attempt', 'flashcard_review'
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Vector Database Schema (Qdrant or PostgreSQL pgvector)
*   **Collection Name:** `paper_chunks`
*   **Vector Dimensions:** 1536 (OpenAI `text-embedding-3-small` / standard LLM embedding)
*   **Payload / Metadata:**
    ```json
    {
      "paper_id": "UUID",
      "chunk_id": "UUID",
      "page_number": 4,
      "section_name": "Methodology",
      "content": "Raw string content of the chunk..."
    }
    ```

### 3.3 Graph Schema (Neo4j Knowledge Graph)
*   **Nodes:**
    *   `(:Paper {id: UUID, title: String, year: Int})`
    *   `(:Concept {name: String, category: String})` -- e.g., "Transformer Models", "Attention Mechanism"
    *   `(:Author {name: String})`
    *   `(:Dataset {name: String})`
*   **Relationships:**
    *   `(:Paper)-[:WRITTEN_BY]->(:Author)`
    *   `(:Paper)-[:CITES]->(:Paper)`
    *   `(:Paper)-[:INTRODUCES]->(:Concept)`
    *   `(:Paper)-[:USES]->(:Dataset)`
    *   `(:Concept)-[:SUBCLASS_OF]->(:Concept)`

---

## 4. API Design

All endpoints communicate via JSON over HTTPS. Chat streaming is supported via WebSocket or Server-Sent Events (SSE).

### 4.1 Ingestion & Paper Management
*   **`POST /api/v1/papers/upload`**
    *   *Payload:* Multipart Form Data (`file: File`)
    *   *Response (202 Accepted):*
        ```json
        {
          "job_id": "job_987654321",
          "status": "queued",
          "message": "File upload complete. Background parsing initiated."
        }
        ```
*   **`GET /api/v1/papers/upload/status/:job_id`**
    *   *Response (200 OK):*
        ```json
        {
          "job_id": "job_987654321",
          "status": "processing", // queued, processing, completed, failed
          "progress_percentage": 65
        }
        ```
*   **`GET /api/v1/papers`**
    *   *Description:* Retrieve list of all uploaded papers for the authenticated user.
*   **`GET /api/v1/papers/:paper_id`**
    *   *Description:* Get comprehensive metadata, extracted sections, and PDF binary storage path.

### 4.2 Interactive Study & Graph Services
*   **`GET /api/v1/papers/:paper_id/mindmap`**
    *   *Response (200 OK):* Nested hierarchical JSON structure compatible with React Flow nodes/edges representation.
*   **`GET /api/v1/papers/:paper_id/graph`**
    *   *Response (200 OK):*
        ```json
        {
          "nodes": [
            { "id": "n1", "label": "Transformer", "type": "Concept" },
            { "id": "n2", "label": "Attention Is All You Need", "type": "Paper" }
          ],
          "edges": [
            { "id": "e1", "source": "n2", "target": "n1", "type": "INTRODUCES" }
          ]
        }
        ```

### 4.3 Chat & AI Tutor
*   **`POST /api/v1/tutor/sessions`**
    *   *Payload:* `{ "paper_id": "UUID" }`
    *   *Response (201 Created):* `{ "session_id": "UUID" }`
*   **`WebSocket /api/v1/tutor/ws/:session_id`**
    *   *Channel Protocols:* Bidirectional event stream.
    *   *Client Send:* `{ "message": "Explain the loss function in section 3." }`
    *   *Server Send (Streaming):* Chunks of text with citations referencing `chunk_id` and `page_number`.

### 4.4 Quiz Engine
*   **`POST /api/v1/quizzes/generate`**
    *   *Payload:* `{ "paper_id": "UUID", "question_count": 5, "mode": "adaptive" }`
    *   *Response (200 OK):* List of questions with structural multiple-choice options.
*   **`POST /api/v1/quizzes/:quiz_id/submit`**
    *   *Payload:* `{ "answers": [{ "question_id": "UUID", "selected_option": "B" }] }`
    *   *Response (200 OK):* Score, correct answers mapping, and conceptual breakdown.

---

## 5. Folder Structure

```text
/home/lucky/Desktop/PROJ/
├── docker-compose.yml              # Local container setups (DBs, Cache)
├── README.md                       # High-level architecture guide
├── docs/                           # API and system specifications
│   └── PROJECT_SPECIFICATION.md
├── frontend/                       # Client Tier (Next.js Application)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── dashboard/
│   │   │   ├── paper/[id]/
│   │   │   └── page.tsx
│   │   ├── components/             # Reusable interactive components
│   │   │   ├── pdf-viewer/
│   │   │   ├── mind-map/
│   │   │   ├── graph-view/
│   │   │   ├── quiz-engine/
│   │   │   └── chat-sidebar/
│   │   ├── hooks/                  # Custom React hooks (WS, layout, fetchers)
│   │   └── lib/                    # React Flow & D3 configuration routines
├── backend/                        # Backend API Server (FastAPI Engine)
│   ├── pyproject.toml
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py                 # FastAPI Application bootstrap
│   │   ├── core/                   # Security, DB connections, config settings
│   │   ├── api/                    # Route endpoints divided by modules
│   │   │   ├── auth.py
│   │   │   ├── papers.py
│   │   │   ├── tutor.py
│   │   │   └── quiz.py
│   │   ├── services/               # Heavy business logic coordinators
│   │   │   ├── parser.py           # PyMuPDF/Grobid handlers
│   │   │   ├── rag_engine.py       # LangChain & Qdrant managers
│   │   │   └── graph_service.py    # Neo4j query orchestrators
│   │   └── models/                 # SQLAlchemy schemas
│   └── tests/                      # Pytest unit & integration suites
└── workers/                        # Ingestion Queue Workers (Celery)
    ├── celery_app.py
    └── tasks.py                    # Heavy async background parsing jobs
```

---

## 6. Milestones & Development Roadmap

### Phase 1: Foundation & Data Pipelines (Week 1–2)
*   **M1.1:** Setup development environment, databases (PostgreSQL, Neo4j, Qdrant) via local Docker Compose.
*   **M1.2:** Write PDF Parsing engine (integrating PyMuPDF) to extract layout, headers, and bibliography.
*   **M1.3:** Build Celery worker pipeline: Upload $\rightarrow$ Parse $\rightarrow$ Chunk $\rightarrow$ Embed $\rightarrow$ Qdrant Insertion.

### Phase 2: Knowledge Extraction & Visualization Engines (Week 3–4)
*   **M2.1:** Implement LLM entity extraction parser to construct Knowledge Graph structures (nodes and relationships) from processed papers.
*   **M2.2:** Build Graph databases updates (Neo4j ingestion queries).
*   **M2.3:** Set up Next.js frontend scaffolding and implement the visual React Flow Mind Map interface.

### Phase 3: Conversational RAG & Flashcards (Week 5–6)
*   **M3.1:** Implement the WebSocket-based AI Research Tutor utilizing LangChain RAG retrieval over Qdrant.
*   **M3.2:** Write flashcard generation algorithms using spaced-repetition logic.
*   **M3.3:** Design the PDF side-by-side split screen viewer in the frontend with text selection and highlighting capabilities.

### Phase 4: Adaptive Quiz Engine & Recommendation Engine (Week 7–8)
*   **M4.1:** Develop the Quiz Generator utilizing LLM structured JSON output.
*   **M4.2:** Build adaptive evaluation rules adjusting question types depending on performance history.
*   **M4.3:** Implement cosine similarity search over vector stores to suggest related academic documents.

### Phase 5: End-to-End Integration, Validation & Launch (Week 9)
*   **M5.1:** Perform comprehensive integration testing.
*   **M5.2:** Secure API authentication protocols, configure load balancers, and construct deployment guidelines.
