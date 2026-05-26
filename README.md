# Seeniun Properties — AI Investment Suite

A working demo built for the AI Solutions Engineer application at Seeniun Properties.

**Live demo:** 3-tab AI suite for Dubai real estate investors.

---

## What's inside

| Tab | Status | What it does |
|-----|--------|--------------|
| 💬 Investor Advisor | ✅ Live | RAG chatbot answering investor questions (DLD fees, Golden Visa, Oqood, ROI by area) |
| 🎯 Lead Qualifier | 🔄 Coming soon | Qualifies budget/area/timeline, ends with Calendly booking |
| 📊 Deal Tracker | 🔄 Coming soon | Google Sheets → n8n → live post-sale status dashboard |

## Tech stack

- **LLM**: Gemini 1.5 Flash (Google Generative AI)
- **RAG pipeline**: LangChain + FAISS vector store
- **Embeddings**: Google `models/embedding-001`
- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite
- **Deployment**: Docker → Railway

---

## Quick start (local)

### Prerequisites
- Python 3.11+
- Node.js 20+
- A free Gemini API key → https://aistudio.google.com/app/apikey

### 1. Clone & configure
```bash
git clone <your-repo-url>
cd seeniun-ai-demo
cp .env.example .env
# Open .env and replace with your actual key:
# GOOGLE_API_KEY=your-real-key-here
```

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# API running at http://localhost:8000
```

### 3. Start the frontend (dev mode)
```bash
cd frontend
npm install
npm run dev
# UI running at http://localhost:5173
```

---

## Deploy to Railway (one command)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Seeniun AI demo"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo
3. Add environment variable: `GOOGLE_API_KEY` = your key
4. Railway auto-detects the Dockerfile and deploys
5. Your demo URL: `https://<project>.up.railway.app`

### Docker (alternative)
```bash
cp .env.example .env  # add your key
docker compose up --build
# App at http://localhost:8000
```

---

## Project structure

```
seeniun-ai-demo/
├── backend/
│   ├── main.py           # FastAPI: /api/chat + serves frontend
│   ├── rag.py            # LangChain + FAISS RAG pipeline
│   ├── data/
│   │   └── dubai_re_sop.md   # 444-line verified knowledge base
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                        # 3-tab layout
│   │   └── components/
│   │       ├── InvestorChatbot.jsx        # WhatsApp-style chat UI
│   │       └── ComingSoon.jsx             # Placeholder tabs
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── Dockerfile            # Multi-stage: builds React → runs FastAPI
├── docker-compose.yml
├── railway.json
└── .env.example
```

---

## API reference

**POST /api/chat**
```json
// Request
{
  "message": "What are the DLD fees?",
  "history": [
    { "user": "Can I get a Golden Visa?", "assistant": "Yes, with AED 2M property..." }
  ]
}

// Response
{
  "answer": "The DLD transfer fee is 4% of the property purchase price..."
}
```

**GET /health** → `{ "status": "ok" }`

---

*Built by Afdhal — AI Solutions Engineer candidate*
