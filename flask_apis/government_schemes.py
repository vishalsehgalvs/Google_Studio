# main.py for gov_schemes_function
import google.generativeai as genai
import os
import json
from flask import jsonify

# Set your API key here or via environment variable
API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    print("Please set the GOOGLE_API_KEY or GEMINI_API_KEY environment variable.")
    exit()

def gov_schemes_function(request_or_json, language=None):
    """
    Provides information on government schemes based on a user query using Gemini Pro.
    Accepts a Flask request, a Python dict (JSON), or a plain string as the query.
    Optionally accepts a language argument for the response.
    """
    try:
        # Accept dict, string, or Flask request
        if isinstance(request_or_json, dict):
            request_json = request_or_json
        elif isinstance(request_or_json, str):
            request_json = {"query": request_or_json}
        else:
            request_json = request_or_json.get_json(silent=True)
        if not request_json:
            return jsonify({"error": "Invalid JSON payload"}), 400

        query = request_json.get("query")
        user_id = request_json.get("user_id", "anonymous")
        lang = language or request_json.get("language", "English")
        state = request_json.get("state", "")
        land_size = request_json.get("landSize", "")
        crops = request_json.get("crops", "")

        if not (state and land_size and crops):
            return jsonify({"error": "Missing 'state', 'landSize', or 'crops' in request"}), 400

        # Compose a detailed prompt for Gemini (plain text response)
        prompt = f'''
Act as an expert on Indian government agricultural schemes.
The user is from the state: {state}. Their land size is: {land_size} acres/hectares. Crops grown: {crops}.
Recommend the most relevant government schemes for this user, considering their state, land size, and crops.
For each recommended scheme, provide the following fields in plain text, one after another, for each scheme:
Title: <scheme title>
Eligibility: <eligibility criteria>
Benefits: <benefits>
Application: <how to apply>
Separate each scheme with a blank line. If no specific scheme matches, suggest general relevant schemes.
Ensure the information is accurate and helpful for farmers. Respond in {lang} language.
Do not include any text outside the scheme details.
'''
        print(f"[DEBUG] Gemini prompt sent:\n{prompt}")

        # Call Gemini API and parse response
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        model_output = response.text
        print(f"[DEBUG] Gemini raw response:\n{model_output}")
        import re
        schemes = []
        # Split by double newlines (blank line between schemes)
        scheme_blocks = re.split(r'\n\s*\n', model_output.strip())
        for block in scheme_blocks:
            title = eligibility = benefits = application = None
            title_match = re.search(r'Title\s*[:：]\s*(.*)', block)
            eligibility_match = re.search(r'Eligibility\s*[:：]\s*([\s\S]*?)(?:\nBenefits|\nApplication|$)', block)
            benefits_match = re.search(r'Benefits\s*[:：]\s*([\s\S]*?)(?:\nApplication|$)', block)
            application_match = re.search(r'Application\s*[:：]\s*([\s\S]*)', block)
            if title_match:
                title = title_match.group(1).strip()
            if eligibility_match:
                eligibility = eligibility_match.group(1).strip()
            if benefits_match:
                benefits = benefits_match.group(1).strip()
            if application_match:
                application = application_match.group(1).strip()
            # Only add if at least title and one other field is present
            if title and (eligibility or benefits or application):
                schemes.append({
                    "title": title,
                    "eligibility": eligibility or "",
                    "benefits": benefits or "",
                    "application": application or ""
                })
        if schemes:
            return {"schemes_information": schemes}
        else:
            return {"error": "No valid schemes found in Gemini response", "raw": model_output}
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"})

