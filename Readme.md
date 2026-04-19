# Fullstack RAG Pipeline 🚀

A high-performance, production-ready Retrieval-Augmented Generation (RAG) system. This project features a distributed architecture with asynchronous document ingestion, semantic vector search, and a premium, responsive user interface.

## 🌟 Key Features

- **Asynchronous Ingestion**: Uses **BullMQ** and **Redis** to process large PDF files in the background without blocking the API.
- **Semantic Vector Search**: Powered by **Qdrant** for high-precision retrieval of relevant document chunks.
- **Advanced LLM Orchestration**: Built with **LangChain** and **Google Gemini 2.5 Flash** for fast and accurate response generation.
- **Premium UI/UX**: A glassmorphic, mobile-responsive dashboard built with **Next.js** and **TailwindCSS**.
- **Secure Authentication**: Fully integrated with **Clerk** for user management and secure access.
- **Source Citation**: Automatically displays page numbers and relevant sources for every AI-generated answer.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, Tailwind CSS, Lucide React, Clerk Auth
- **Backend API**: Node.js, Express.js
- **Ingestion Worker**: BullMQ, Redis
- **Vector Database**: Qdrant
- **AI/LLM**: LangChain, Google Generative AI (Gemini 2.5 Flash, Gemini-Embedding-001)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker (for Qdrant and Redis)
- Google AI Studio API Key (Gemini)
- Clerk API Keys

### 1. Clone the repository
```bash
git clone https://github.com/MohammedFawzaan/RAG-pipeline.git
cd RAG-pipeline
```

### 2. Infrastructure Setup (Docker)
Run the following to start Qdrant and Redis:
```bash
docker-compose up -d
```

### 3. Server Setup
```bash
cd server
npm install
# Create .env and add:
# PORT=8000
# GOOGLE_API_KEY=your_key
# QDRANT_URL=http://localhost:6333
# REDIS_HOST=localhost
# REDIS_PORT=6379
npm run dev
```

### 4. Worker Setup
In a new terminal:
```bash
cd server
npm run dev:worker
```

### 5. Client Setup
```bash
cd client
npm install
# Create .env.local and add:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
npm run dev
```

## 📖 How it Works

1. **Upload**: When a PDF is uploaded, the API submits a job to a **Redis-backed queue**.
2. **Ingest**: The **Ingestion Worker** picks up the job, parses the PDF, and splits it into semantic chunks using LangChain's `RecursiveCharacterTextSplitter`.
3. **Embed**: Chunks are converted into vectors via `gemini-embedding-001` and stored in **Qdrant**.
4. **Retrieve**: When you chat, your query is embedded and used to perform a similarity search in Qdrant.
5. **Answer**: The top relevant chunks are passed as context to **Gemini 2.5 Flash** to generate a grounded, accurate response.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Mohammed Fawzaan](https://github.com/MohammedFawzaan)
