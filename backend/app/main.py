# app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .clients import financial_data
from . import llm_services

# --- Pydantic Models for Request Bodies ---
class WatchlistRequest(BaseModel):
    tickers: list[str]

class AskRequest(BaseModel):
    query: str

# --- FastAPI App Initialization & Middleware ---
app = FastAPI()

origins = [
    "https://finai-gray.vercel.app",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"status": "FinanceAI Backend is running"}

@app.get("/api/dashboard/overview")
def get_dashboard_overview():
    """Endpoint for the dashboard's market overview card."""
    return financial_data.get_index_quotes()

@app.get("/api/market-trends")
def get_market_trends_data():
    """Endpoint for the dashboard's market trend chart."""
    # Fetching 90 days of daily data for the S&P 500 ETF from Twelve Data
    data = financial_data.get_stock_candles('SPY', '1day', 90)
    if not data:
        raise HTTPException(status_code=500, detail="Could not fetch market trend data.")
    return data

@app.get("/api/news")
def get_market_news():
    """Endpoint for the main market news page, powered by Yahoo Finance."""
    articles = financial_data.get_news_from_yahoo() # Updated function call
    for article in articles:
        if 'sentiment' not in article:
            text_to_analyze = f"{article.get('headline', '')}. {article.get('summary', '')}"
            article['sentiment'] = llm_services.classify_sentiment(text_to_analyze)
    return articles

@app.post("/api/watchlist")
def get_watchlist_data(request: WatchlistRequest):
    """Endpoint for the user's watchlist."""
    quotes = financial_data.get_batch_quotes(request.tickers)
    for quote in quotes:
        quote['news'] = financial_data.get_news_for_ticker(quote['ticker'])
    
    # Process AI insights in one single batched LLM API call
    quotes = llm_services.add_batch_ai_insights(quotes)
    return quotes

@app.post("/api/ask")
def ask_ai_assistant(request: AskRequest):
    """Endpoint for the AI financial assistant chat."""
    answer = llm_services.answer_question(request.query)
    return {"answer": answer}


@app.get("/api/crypto")
def get_crypto_market_data():
    """Endpoint for the cryptocurrency market page."""
    symbols = ("BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "DOGE/USD")
    return financial_data.get_crypto_data(symbols)