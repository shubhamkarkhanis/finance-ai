# app/llm_services.py

import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
from .clients import financial_data

load_dotenv()

# --- Word List Loading ---
def load_word_list(file_path: str) -> set:
    """
    Loads a list of words from a text file into a set.
    It tries multiple encodings to handle common file format issues.
    """
    if not os.path.exists(file_path):
        print(f"⚠️ Warning: Word list file not found at '{file_path}'.")
        return set()
    
    for encoding in ['utf-8', 'latin-1', 'utf-8-sig']:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                words = {line.strip().lower() for line in f if line.strip()}
            print(f"✅ Loaded {len(words)} words from '{file_path}' (using {encoding} encoding).")
            return words
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Error loading word list from '{file_path}' with encoding '{encoding}': {e}")
            return set()
            
    print(f"Error: Could not decode the file '{file_path}' with any of the attempted encodings.")
    return set()

# Construct paths relative to the current script's location
base_dir = os.path.dirname(os.path.abspath(__file__))
positive_words = load_word_list(os.path.join(base_dir, 'positive-words.txt'))
negative_words = load_word_list(os.path.join(base_dir, 'negative-words.txt'))

# --- Gemini Model Configuration ---
model = None
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # model = genai.GenerativeModel('gemini-2.0-flash')
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("✅ Gemini model configured successfully (gemini-2.5-flash).")
    except Exception as e:
        print(f"⚠️ Warning: could not configure Gemini model: {e}")
else:
    print("⚠️ Warning: GOOGLE_API_KEY not found. Using fallback methods.")

def _extract_tickers(query: str) -> list:
    """Extracts potential stock tickers from a query using regex."""
    return re.findall(r'\b[A-Z]{1,5}\b', query)

def classify_sentiment(headline: str):
    """Classifies a headline as POSITIVE, NEGATIVE, or NEUTRAL using local keyword matching."""
    if not headline or not headline.strip():
        return "NEUTRAL"
    
    low = headline.lower()
    if any(word in low for word in positive_words):
        return 'POSITIVE'
    if any(word in low for word in negative_words):
        return 'NEGATIVE'
    
    return 'NEUTRAL'

def get_ai_insight_for_ticker(ticker: str, news_items: list[dict]):
    """Generates a concise AI insight based on news headlines."""
    if not news_items:
        return f"No recent news found for {ticker}."
    
    headlines = "\n".join([f"- {item['headline']}" for item in news_items if item.get('headline')])
    if not headlines:
        return f"No recent news headlines found for {ticker}."

    if model:
        try:
            prompt = f"""
            Act as a professional financial analyst. Based on these recent headlines for {ticker}, write a single, concise sentence (max 20 words) suitable for an 'AI Insight' label in a watchlist. Return only the sentence.

            Headlines:
            {headlines}

            AI Insight:
            """
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating AI insight: {e}")

    first_headline = news_items[0].get('headline', 'recent developments')
    return f"Key headline for {ticker}: {first_headline[:100]}..."

import json

def add_batch_ai_insights(quotes: list[dict]):
    """Processes AI insights for all quotes in a single LLM call to save API quota."""
    if not model or not quotes:
        for q in quotes:
            news = q.get('news', [])
            if news:
                q['ai_insight'] = f"Key headline: {news[0].get('headline', '')[:80]}..."
            else:
                q['ai_insight'] = "No recent insights."
        return quotes

    # Prepare prompt data
    prompt_data = ""
    for q in quotes:
        ticker = q['ticker']
        news = q.get('news', [])
        headlines = "\n".join([f"- {item['headline']}" for item in news[:3] if item.get('headline')])
        prompt_data += f"Ticker: {ticker}\nHeadlines:\n{headlines}\n\n"

    try:
        prompt = f"""
        Act as a professional financial analyst. Based on the recent headlines for the following tickers, write a single, concise sentence (max 15 words) insight for EACH ticker.
        
        {prompt_data}
        
        Return your response ONLY as a valid JSON object mapping each ticker to its insight string. For example:
        {{"AAPL": "Strong earnings expected to drive growth.", "MSFT": "AI integration boosts cloud revenue prospects."}}
        Do not output markdown code blocks.
        """
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        insights = json.loads(text)
        
        for q in quotes:
            ticker = q['ticker']
            if ticker in insights:
                q['ai_insight'] = insights[ticker]
            else:
                news = q.get('news', [])
                q['ai_insight'] = f"Key headline: {news[0].get('headline', '')[:80]}..." if news else "No insights."
                
    except Exception as e:
        print(f"Error in batch AI insights: {e}")
        for q in quotes:
            news = q.get('news', [])
            q['ai_insight'] = f"Key headline: {news[0].get('headline', '')[:80]}..." if news else "No insights."
            
    return quotes

def answer_question(query: str):
    """
    Answers a financial question. If stock tickers are mentioned, it fetches
    real-time data to provide a context-aware, data-driven response (RAG).
    """
    if not model:
        return "The AI Assistant is currently unavailable. Please try again later."

    tickers = _extract_tickers(query)
    
    context = ""
    if tickers:
        print(f"Found tickers in query: {tickers}")
        for ticker in tickers:
            quote = financial_data.get_single_quote(ticker)
            news = financial_data.get_news_for_ticker(ticker)
            
            context += f"\n\n--- CONTEXT FOR {ticker} ---\n"
            if quote and quote.get('price') is not None:
                context += f"Current Price: ${quote['price']:.2f} (Change: {quote.get('change', 0):.2f}, {quote.get('change_percent', 0):.2f}%)\n"
            
            if news:
                context += "Recent News:\n"
                for item in news:
                    context += f"- {item.get('headline', 'No headline')}\n"
            else:
                context += "No recent news found.\n"
        context += "-------------------------\n"

    if context:
        prompt = f"""
        You are an expert financial analyst. Your task is to answer the user's question based on the real-time contextual data provided below.
        Format your answer clearly in Markdown.

        {context}

        User's Question: {query}
        """
    else:
        prompt = f"""
        You are an expert financial analyst. Answer the following question clearly and concisely in Markdown. 
        Use sections or bullet points where helpful. Keep the answer under 300 words.
        
        Question: {query}
        """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error answering question with Gemini: {e}")
        return "Sorry, I encountered an error while processing your request."