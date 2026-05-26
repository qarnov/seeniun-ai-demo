"""
Seeniun Properties — RAG Pipeline
LangChain + FAISS + Gemini 1.5 Flash
"""

import os
import asyncio
from pathlib import Path

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

SOP_PATH = Path(__file__).parent / "data" / "dubai_re_sop.md"

SYSTEM_PROMPT = """You are Maya, Seeniun Properties' AI investment advisor — warm, sharp, and precise.
You help overseas investors understand Dubai real estate using the knowledge base below.

Guidelines:
- Always give specific numbers when you have them (fees, yields, thresholds)
- If the knowledge base doesn't cover something, say so honestly and offer to connect them with a Seeniun advisor
- Keep answers concise but complete — investors are busy people
- Never invent figures. The DLD fee is 4%, the Golden Visa threshold is AED 2M, etc.
- End responses with a relevant follow-up question to keep the conversation moving

Context from knowledge base:
{context}

Conversation so far:
{chat_history}

Investor's question: {question}

Maya's answer:"""

_chain = None


def _build_chain() -> ConversationalRetrievalChain:
    """Build the FAISS-backed RAG chain. Called once at startup."""

    # 1 — Load the SOP document
    loader = TextLoader(str(SOP_PATH), encoding="utf-8")
    raw_docs = loader.load()

    # 2 — Split into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )
    chunks = splitter.split_documents(raw_docs)

    # 3 — Embed with Google's embedding model + build FAISS index
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GOOGLE_API_KEY,
    )
    vectorstore = FAISS.from_documents(chunks, embeddings)

    # 4 — Gemini 1.5 Flash as the LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3,
        convert_system_message_to_human=True,
    )

    # 5 — Custom prompt
    prompt = PromptTemplate(
        input_variables=["context", "chat_history", "question"],
        template=SYSTEM_PROMPT,
    )

    # 6 — Conversational retrieval chain
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
        combine_docs_chain_kwargs={"prompt": prompt},
        return_source_documents=False,
        verbose=False,
    )

    return chain


def get_chain() -> ConversationalRetrievalChain:
    global _chain
    if _chain is None:
        print("🔨 Building RAG index from SOP…")
        _chain = _build_chain()
        print("✅ RAG chain ready.")
    return _chain


async def answer(question: str, history: list[dict]) -> str:
    """
    Run the RAG chain asynchronously.
    history: list of {"user": "...", "assistant": "..."} dicts
    """
    chain = get_chain()

    # Convert history to LangChain's (human, ai) tuple format
    chat_history = [
        (turn["user"], turn["assistant"])
        for turn in history
        if "user" in turn and "assistant" in turn
    ]

    result = await asyncio.to_thread(
        chain.invoke,
        {"question": question, "chat_history": chat_history},
    )
    return result["answer"]
