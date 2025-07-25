import google.generativeai as genai
import os
import json
from flask import jsonify

# Set your API key here or via environment variable
API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    print("Please set the GOOGLE_API_KEY or GEMINI_API_KEY environment variable.")
    exit()

 # --- Gemini Market Prices ---
def fetch_market_prices(location, user_id="anonymous", language="en"):
    try:
        print("[DEBUG] fetch_market_prices invoked with location:", location, "user_id:", user_id)
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        crops_prompt = (
            f"List the main crops grown in {location} region in India. "
            "Return only a comma-separated list of crop names, no explanation, no extra text."
        )
        print(f"Sending request to Gemini for crops list in {location} for user: {user_id}")
        crops_response = model.generate_content(crops_prompt)
        print("[DEBUG] Gemini crops response object:", crops_response)
        crops_text = getattr(crops_response, 'text', '').strip() if crops_response else ''
        print("Gemini crops output:", crops_text)
        if not crops_text:
            print(f"[ERROR] Gemini returned empty crops response for location: {location}")
            return {"error": "Gemini returned empty crops response", "raw": str(crops_response)}
        crops = [c.strip() for c in crops_text.split(',') if c.strip()]
        if not crops:
            print(f"[ERROR] Could not extract crops from Gemini response: {crops_text}")
            return {"error": "Could not extract crops from Gemini response", "raw": crops_text}
        crops_str = ", ".join(crops)
        price_prompt = (
            f"List the latest market price per quintal for the following crops in {location} region in India: {crops_str}. "
            "Respond in the format: <Crop Name>: INR <price>/quintal, one crop per line, no explanation, no extra text."
        )
        print(f"Sending single request to Gemini for prices of crops in {location} for user: {user_id}")
        price_response = model.generate_content(price_prompt)
        print("[DEBUG] Gemini prices response object:", price_response)
        price_text = getattr(price_response, 'text', '').strip() if price_response else ''
        print("Gemini prices output:", price_text)
        if not price_text:
            print(f"[ERROR] Gemini returned empty prices response for crops: {crops_str}")
            return {"error": "Gemini returned empty prices response", "raw": str(price_response)}
        import re
        prices = {}
        for line in price_text.splitlines():
            match = re.match(r"([\w\s]+):\s*INR\s*([\d,]+)\s*/\s*quintal", line.strip())
            if match:
                crop_name = match.group(1).strip()
                price = match.group(2).replace(",", "")
                prices[crop_name] = price
        if not prices:
            print(f"[ERROR] Could not extract prices from Gemini response: {price_text}")
            return {"error": "Could not extract prices from Gemini response", "raw": price_text}
        return {"crops": list(prices.keys()), "prices": prices}
    except Exception as e:
        print(f"Error in fetch_market_prices: {e}")
        return {"error": f"Internal server error: {str(e)}"}

 # --- Gemini Market Analysis ---
def fetch_market_analysis(location, crop, user_id="anonymous", language="en"):
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            f"Provide a detailed market analysis for {crop} in the {location} region, "
            "considering government set prices, recent trends, and factors affecting yield. "
            "Include the latest market price for {crop} in the format: 'Price: INR <price>/quintal' as a separate line at the top. "
            "Also include potential price forecasts for the next 3 months.\n"
            "Respond in the following format as plain text (not JSON, not Markdown):\n"
            "Price: INR <price>/quintal\n"
            "Trend: <summary of the current market trend>\n"
            "Factors: <key factors affecting the market>\n"
            "Forecast: <price forecast for the next 3 months>\n"
            "Summary: <concise summary of the market situation>\n"
            "Example:\n"
            "Price: INR 2200/quintal\n"
            "Trend: Prices have been rising steadily due to increased demand.\n"
            "Factors: High demand, low rainfall, government MSP.\n"
            "Forecast: Prices expected to rise 10% over the next 3 months.\n"
            "Summary: The market outlook is positive for farmers."
        )
        print(f"Sending request to Gemini for market analysis of {crop} in {location} for user: {user_id}")
        response = model.generate_content(prompt)
        model_output = response.text
        print("Gemini raw output:", model_output)  # Log the raw model output
        import re
        price_match = re.search(r"[Pp]rice\s*[:：]\s*INR\s*([\d,]+)\s*/\s*quintal", model_output)
        price = price_match.group(1).replace(",", "") if price_match else None
        trend_match = re.search(r"[Tt]rend\s*[:：]\s*([\s\S]*?)(?:\n[Ff]actors\s*[:：]|\n[Ff]orecast\s*[:：]|\n[Ss]ummary\s*[:：]|$)", model_output)
        factors_match = re.search(r"[Ff]actors\s*[:：]\s*([\s\S]*?)(?:\n[Ff]orecast\s*[:：]|\n[Ss]ummary\s*[:：]|$)", model_output)
        forecast_match = re.search(r"[Ff]orecast\s*[:：]\s*([\s\S]*?)(?:\n[Ss]ummary\s*[:：]|$)", model_output)
        summary_match = re.search(r"[Ss]ummary\s*[:：]\s*([\s\S]*?)$", model_output)
        trend = trend_match.group(1).strip() if trend_match else None
        factors = factors_match.group(1).strip() if factors_match else None
        forecast = forecast_match.group(1).strip() if forecast_match else None
        summary = summary_match.group(1).strip() if summary_match else None
        print(f"[DEBUG] Parsed price: {price}, trend: {trend}, factors: {factors}, forecast: {forecast}, summary: {summary}")
        result = {
            "price": price,
            "trend": trend,
            "factors": factors,
            "forecast": forecast,
            "summary": summary,
            "crop": crop
        }
        return {"market_analysis": [result]}
    except Exception as e:
        print(f"Error in fetch_market_analysis: {e}")
        return {"error": f"Internal server error: {str(e)}"}
            # ...existing code...
