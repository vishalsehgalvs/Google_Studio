
from flask import Flask, request, jsonify

from flask_cors import CORS

from crop_analysis import analyze_crop_image
from market_analysis import fetch_market_prices, fetch_market_analysis
from government_schemes import gov_schemes_function

import base64
import json


app = Flask(__name__)
CORS(app)

# Health check / welcome route
@app.route('/')
def index():
    return "Flask API is running!", 200

@app.route('/diagnose', methods=['POST'])
def diagnose():
    print('[DEBUG] /diagnose endpoint called')
    if 'image' not in request.files:
        print('[ERROR] No image uploaded in request.files')
        return jsonify({'error': 'No image uploaded'}), 400
    language = request.form.get('language', 'English')
    file = request.files['image']
    print(f'[DEBUG] Received file: {file.filename}, language: {language}')
    try:
        img_bytes = file.read()
        print(f'[DEBUG] Read {len(img_bytes)} bytes from uploaded image')
        base64_image_str = base64.b64encode(img_bytes).decode('utf-8')
        result, error = analyze_crop_image(base64_image_str, language)
        print(f'[DEBUG] analyze_crop_image result: {result}, error: {error}')
        if error:
            print(f'[ERROR] analyze_crop_image error: {error}')
            return jsonify({'error': error}), 500
        # Parse Gemini plain text response and jsonify it
        try:
            import re
            # Example expected format:
            # Disease: ...\nRemedies: ...\nConfidence Score: ...
            print(f'[DEBUG] Gemini raw text response: {result}')
            # Use regex with DOTALL to capture multiline values, and stop at the next label or end of string
            # Try to extract crop name robustly (allow for missing label or label at any position)
            crop_match = re.search(r"[Cc]rop\s*[Nn]ame\s*[:：]\s*([\s\S]*?)(?:\n[Dd]isease [Ii]dentified\s*[:：]|\n[Rr]emedies\s*[:：]|\n[Cc]onfidence\s*[Ss]core\s*[:：]|$)", result)
            if not crop_match:
                # Try to extract crop name from the first line if label is missing
                first_line = result.strip().split('\n')[0]
                # If the first line is not a label, treat it as crop name if it looks like a single word or phrase
                if (':' not in first_line) and (len(first_line.split()) <= 5):
                    crop_name = first_line.strip()
                else:
                    crop_name = None
            else:
                crop_name = crop_match.group(1).strip()
            disease_match = re.search(r"[Dd]isease [Ii]dentified\s*[:：]\s*([\s\S]*?)(?:\n[Rr]emedies\s*[:：]|\n[Cc]onfidence\s*[Ss]core\s*[:：]|$)", result)
            remedies_match = re.search(r"[Rr]emedies\s*[:：]\s*([\s\S]*?)(?:\n[Cc]onfidence\s*[Ss]core\s*[:：]|$)", result)
            confidence_match = re.search(r"[Cc]onfidence\s*[Ss]core\s*[:：]\s*([\d.]+)", result)
            disease = disease_match.group(1).strip() if disease_match else None
            remedies = remedies_match.group(1).strip() if remedies_match else None
            confidence = confidence_match.group(1).strip() if confidence_match else None
            # Cast confidenceScore to float for frontend compatibility
            try:
                confidence_float = float(confidence) if confidence is not None else None
            except Exception:
                confidence_float = None
            print(f'[DEBUG] Parsed cropName: {crop_name}, disease: {disease}, remedies: {remedies}, confidenceScore: {confidence_float}')
            # If all fields are present, return in { success: true, result: { ... } }
            if crop_name and disease and remedies and confidence_float is not None:
                return jsonify({
                    'success': True,
                    'result': {
                        'cropName': crop_name,
                        'disease': disease,
                        'remedies': remedies,
                        'confidenceScore': confidence_float
                    }
                })
            # If crop_name, disease and remedies are present but confidenceScore is missing, return with confidenceScore as null
            if crop_name and disease and remedies:
                print(f'[WARN] confidenceScore missing, returning null. Raw Gemini response: {result}')
                return jsonify({
                    'success': True,
                    'result': {
                        'cropName': crop_name,
                        'disease': disease,
                        'remedies': remedies,
                        'confidenceScore': None,
                        'raw': result
                    }
                }), 200
            # Otherwise, return error with raw response for debugging
            print(f'[ERROR] Could not extract all fields from Gemini response: {result}')
            return jsonify({'success': False, 'error': 'Could not extract all fields from Gemini response', 'raw': result}), 500
        except Exception as e:
            print(f'[ERROR] Failed to parse Gemini text response: {e}, raw: {result}')
            return jsonify({'success': False, 'error': f'Failed to parse Gemini text response: {str(e)}', 'raw': result}), 500
    except Exception as e:
        print(f'[ERROR] Exception in /diagnose: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500

# --- Market Prices Endpoint ---
@app.route('/api/market-prices', methods=['POST'])
def market_prices():
    print("[DEBUG] /api/market-prices endpoint invoked")
    print("[DEBUG] Request headers:", dict(request.headers))
    print("[DEBUG] Request data:", request.data)
    try:
        data = request.get_json(force=True) or {}
    except Exception as e:
        print(f"[ERROR] Could not parse JSON: {e}")
        data = {}
    print("[DEBUG] Parsed JSON:", data)
    location = data.get('location', 'Unknown')
    language = data.get('language', 'English')
    user_id = data.get('user_id', 'anonymous')

    result = fetch_market_prices(location, user_id, language)
    if isinstance(result, dict) and "crops" in result and "prices" in result:
        return jsonify({"success": True, "crops": result["crops"], "prices": result["prices"]})
    else:
        return jsonify({"success": False, "error": "Could not fetch crops and prices"})

# New endpoint: fetch market analysis for a crop

@app.route('/api/market-analysis', methods=['POST'])
def market_analysis():
    data = request.get_json() or {}
    location = data.get('location', 'Unknown')
    language = data.get('language', 'English')
    crop = data.get('crop')
    user_id = data.get('user_id', 'anonymous')

    if not crop:
        return jsonify({"success": False, "error": "No crop specified for market analysis"})
    result = fetch_market_analysis(location, crop, user_id, language)
    if isinstance(result, dict) and "market_analysis" in result:
        if isinstance(result["market_analysis"], list):
            return jsonify({"success": True, "result": result["market_analysis"]})
        else:
            return jsonify({"success": True, "result": [result["market_analysis"]]})
    else:
        return jsonify({"success": False, "error": result.get("error", "Unknown error"), "raw": result.get("raw", "")})


@app.route('/api/scheme-recommendation', methods=['POST'])
def gov_schemes():
    data = request.get_json() or {}
    state = data.get('state', '')
    land_size = data.get('landSize', '')
    crops = data.get('crops', '')
    language = data.get('language', 'English')
    user_id = data.get('user_id', 'anonymous')
    # Compose a query string for Gemini prompt
    query = f"State: {state}\nLand Size: {land_size}\nCrops Grown: {crops}"
    req_json = {
        "query": query,
        "user_id": user_id,
        "language": language,
        "state": state,
        "landSize": land_size,
        "crops": crops
    }
    result = gov_schemes_function(req_json, language=language)
    # If the function returns a tuple (Flask error), handle it
    if isinstance(result, tuple) and len(result) == 2:
        return result
    if isinstance(result, dict) and "error" in result:
        print(f'[ERROR] gov_schemes_function error: {result["error"]}')
        return jsonify({'error': result["error"]}), 500
    # Flatten if result is already wrapped
    if isinstance(result, dict) and "schemes_information" in result:
        schemes = result["schemes_information"]
        # If it's a list with a single dict that also has schemes_information, flatten again
        if (
            isinstance(schemes, list)
            and len(schemes) == 1
            and isinstance(schemes[0], dict)
            and "schemes_information" in schemes[0]
        ):
            schemes = schemes[0]["schemes_information"]
        return jsonify({"schemes_information": schemes})
    # Otherwise, wrap as usual
    return jsonify({"schemes_information": result if isinstance(result, list) else [result]})


@app.route('/api/climate-advisory', methods=['POST'])
def climate_advisory():
    data = request.get_json() or {}
    location = data.get('location', 'Unknown')
    language = data.get('language', 'English')
    from climate_advisory import get_climate_advisory
    try:
        result = get_climate_advisory(location, language)
        if isinstance(result, dict) and 'error' in result:
            print(f"[ERROR] climate_advisory: {result['error']}")
            return jsonify({'error': result['error']}), 500
        # Defensive: ensure advisory and weather keys exist
        if not (isinstance(result, dict) and 'advisory' in result and 'weather' in result):
            print(f"[ERROR] climate_advisory: Unexpected result structure: {result}")
            return jsonify({'error': 'Unexpected result structure from Gemini', 'raw': result}), 500
        return jsonify(result)
    except Exception as e:
        import traceback
        print(f"[ERROR] Exception in /api/climate-advisory: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Exception in /api/climate-advisory: {str(e)}'}), 500

@app.route('/api/drone-analysis', methods=['POST'])
def drone_analysis():
    return jsonify({
        'analysis': 'Dummy drone analysis.',
        'hotspots': [
            { 'issue': 'Dummy issue 1', 'recommendation': 'Dummy recommendation 1' },
            { 'issue': 'Dummy issue 2', 'recommendation': 'Dummy recommendation 2' }
        ]
    })

@app.route('/api/soil-analysis', methods=['POST'])
def soil_analysis():
    return jsonify({
        'analysis': 'Dummy soil health analysis.',
        'recommendations': ['Dummy recommendation 1', 'Dummy recommendation 2']
    })

@app.route('/api/order-supplies', methods=['POST'])
def order_supplies():
    return jsonify({
        'suppliers': [
            { 'name': 'Dummy Supplier 1', 'type': 'local', 'contact': '1234567890' },
            { 'name': 'Dummy Supplier 2', 'type': 'global', 'contact': 'dummy@example.com' }
        ]
    })

@app.route('/api/diagnosis-followup', methods=['POST'])
def diagnosis_followup():
    return jsonify({
        'answer': 'Dummy follow-up answer.'
    })

@app.route('/api/voice-query-to-text', methods=['POST'])
def voice_query_to_text():
    return jsonify({
        'text': 'Dummy transcribed text.'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

