# app/clients/financial_data.py

import yfinance as yf
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from cachetools import cached, TTLCache

# --- Setup Caches ---
# maxsize=100 items, ttl=300 seconds (5 minutes)
market_cache = TTLCache(maxsize=100, ttl=300)
news_cache = TTLCache(maxsize=100, ttl=300)
crypto_cache = TTLCache(maxsize=100, ttl=300)

@cached(cache=crypto_cache)
def get_crypto_data(symbols: list):
    """Fetches crypto data (Cached for 5 mins)."""
    yf_symbols = [s.replace('/', '-') for s in symbols]
    data = []
    
    for orig_symbol, yf_symbol in zip(symbols, yf_symbols):
        try:
            ticker = yf.Ticker(yf_symbol)
            hist = ticker.history(period="1mo") 
            if hist.empty: continue
            
            current_price = float(hist['Close'].iloc[-1])
            prev_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
            change = current_price - prev_price
            
            data.append({
                "name": yf_symbol.split('-')[0],
                "symbol": orig_symbol,
                "price": current_price,
                "change": change,
                "percent_change": (change / prev_price) * 100 if prev_price else 0,
                "history": hist['Close'].tolist()
            })
        except Exception as e:
            print(f"Error fetching yfinance crypto '{orig_symbol}': {e}")
            
    return data

@cached(cache=market_cache)
def get_stock_candles(ticker: str, interval: str, outputsize: int):
    """Fetches historical stock data (Cached for 5 mins)."""
    yf_interval = '1d' if interval == '1day' else interval 
    try:
        hist = yf.Ticker(ticker).history(period=f"{outputsize}d", interval=yf_interval)
        if hist.empty: return None
        return {
            "dates": hist.index.strftime('%Y-%m-%d').tolist(),
            "prices": hist['Close'].tolist()
        }
    except Exception as e:
        return None

def get_single_quote(ticker: str):
    """Real-time quote (Not cached so watchlists are accurate)."""
    try:
        hist = yf.Ticker(ticker).history(period="5d")
        if hist.empty: return None
        current = float(hist['Close'].iloc[-1])
        prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current
        return {
            "price": current,
            "change": current - prev,
            "change_percent": ((current - prev) / prev) * 100 if prev else 0
        }
    except Exception as e:
        return None

@cached(cache=market_cache)
def get_index_quotes():
    """Fetches major indices (Cached for 5 mins)."""
    indices = {'S&P 500': '^GSPC', 'NASDAQ': '^IXIC', 'Dow Jones': '^DJI'}
    data = []
    for name, ticker in indices.items():
        try:
            hist = yf.Ticker(ticker).history(period="5d")
            if hist.empty: continue
            current = float(hist['Close'].iloc[-1])
            prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current
            data.append({
                "name": name, "ticker": ticker, "price": current,
                "change": current - prev, "change_percent": ((current - prev)/prev)*100 if prev else 0
            })
        except Exception as e:
            pass
    return data

def get_batch_quotes(tickers: list[str]):
    """Fetches real-time quotes (Not cached so watchlists are accurate)."""
    quotes = []
    for ticker in tickers:
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period="5d")
            if hist.empty: continue
            current = float(hist['Close'].iloc[-1])
            prev = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current
            company_name = t.info.get('shortName', ticker) if hasattr(t, 'info') else ticker
            quotes.append({
                "ticker": ticker, "name": company_name, "price": current,
                "change": current - prev, "change_percent": ((current - prev)/prev)*100 if prev else 0
            })
        except Exception as e:
            pass
    return quotes

def get_news_for_ticker(ticker: str):
    """Ticker-specific news."""
    try:
        url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}"
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        root = ET.fromstring(response.content)
        items = root.findall('.//item')
        return [{
            "headline": item.findtext('title'),
            "summary": "Yahoo Finance News",
            "url": item.findtext('link'),
        } for item in items[:3]]
    except Exception as e:
        return []

@cached(cache=news_cache)
def get_news_from_yahoo():
    """
    Renamed internally to avoid breaking main.py.
    Now uses the ultra-reliable Yahoo Finance RSS Feed directly.
    Cached for 5 minutes.
    """
    try:
        # Fetching general market news using SPY and QQQ
        url = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ"
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        # Parse the XML feed
        root = ET.fromstring(response.content)
        items = root.findall('.//item')
        
        news_list = []
        for item in items[:15]:  # Grab top 15 articles
            title = item.findtext('title')
            link = item.findtext('link')
            pubDate = item.findtext('pubDate')
            
            news_list.append({
                "source": "Yahoo Finance",
                "headline": title,
                "summary": f"Recent market update: {title}",
                "url": link,
                "timestamp": pubDate
            })
        return news_list
    except Exception as e:
        print(f"Error fetching RSS news: {e}")
        return []