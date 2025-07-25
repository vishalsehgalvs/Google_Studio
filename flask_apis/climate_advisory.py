import os
import google.generativeai as genai
from flask import jsonify
import re

# --- Gemini API key management (module level, like crop_analysis.py) ---
API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
print(f"[DEBUG] Using API_KEY: {API_KEY[:8]}...{'set' if API_KEY else 'NOT SET'} (climate_advisory.py)")
if genai and API_KEY:
    print("[DEBUG] Configuring genai with API_KEY (climate_advisory.py).")
    genai.configure(api_key=API_KEY)
else:
    print("[ERROR] genai or API_KEY missing in climate_advisory.py. genai:", genai, "API_KEY:", bool(API_KEY))

def get_climate_advisory(location, language='English'):
    """
    Calls Gemini to get hyper-local weather and AI-powered farming advice for a location.
    """
    if not genai or not API_KEY:
        return {"error": "Gemini AI or API key not set in environment (climate_advisory.py)."}
    prompt = f'''
Act as an expert agri-weather advisor.
Provide a hyper-local weather forecast and actionable farming advice for the following location:
Location: {location}
Respond in {language} language.
Format your response exactly as below, using the translated section headers for the chosen language:
Advisory:
- <Advice point 1>
- <Advice point 2>
- <Advice point 3>
Weather:
  Temperature: <value in °C>
  Humidity: <value in %>
  WindSpeed: <value in km/h>
  Precipitation: <value or description>
  Forecast: <short weather summary>
Do not include greetings or extra text. Only output the sections above, with each section starting on a new line.
'''
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text if hasattr(response, 'text') else str(response)
        print(f"[DEBUG] Gemini raw response:\n{text}")
        section_headers = {
            'en': {
                'advisory': 'Advisory',
                'weather': 'Weather',
                'temperature': 'Temperature',
                'humidity': 'Humidity',
                'wind': 'WindSpeed',
                'precip': 'Precipitation',
                'forecast': 'Forecast'
            },
            'hi': {
                'advisory': 'सलाह',
                'weather': 'मौसम',
                'temperature': 'तापमान',
                'humidity': 'नमी',
                'wind': 'पवन गति',
                'precip': 'वर्षा',
                'forecast': 'पूर्वानुमान'
            },
            'mr': {
                'advisory': 'सल्ला',
                'weather': 'हवामान',
                'temperature': 'तापमान',
                'humidity': 'आर्द्रता',
                'wind': 'वारा वेग',
                'precip': 'पर्जन्य',
                'forecast': 'पूर्वानुमान'
            },
            'ta': {
                'advisory': 'ஆலோசனை',
                'weather': 'வானிலை',
                'temperature': 'வெப்பநிலை',
                'humidity': 'ஈரப்பதம்',
                'wind': 'காற்றின் வேகம்',
                'precip': 'மழை',
                'forecast': 'முன்னறிவு'
            },
            'bn': {
                'advisory': 'পরামর্শ',
                'weather': 'আবহাওয়া',
                'temperature': 'তাপমাত্রা',
                'humidity': 'আর্দ্রতা',
                'wind': 'বাতাসের গতি',
                'precip': 'বৃষ্টিপাত',
                'forecast': 'পূর্বাভাস'
            },
            'gu': {
                'advisory': 'સલાહ',
                'weather': 'હવામાન',
                'temperature': 'તાપમાન',
                'humidity': 'આર્દ્રતા',
                'wind': 'પવનની ઝડપ',
                'precip': 'વરસાદ',
                'forecast': 'પૂર્વાનુમાન'
            },
            'kn': {
                'advisory': 'ಸಲಹೆ',
                'weather': 'ಹವಾಮಾನ',
                'temperature': 'ತಾಪಮಾನ',
                'humidity': 'ಆದ್ರತೆ',
                'wind': 'ಗಾಳಿಯ ವೇಗ',
                'precip': 'ವರ್ಷಾ',
                'forecast': 'ಪೂರ್ವಾನುಮಾನ'
            },
            'ml': {
                'advisory': 'അഭിപ്രായം',
                'weather': 'കാലാവസ്ഥ',
                'temperature': 'താപനില',
                'humidity': 'ആർദ്രത',
                'wind': 'കാറ്റിന്റെ വേഗം',
                'precip': 'മഴ',
                'forecast': 'പ്രവചനം'
            },
            'pa': {
                'advisory': 'ਸਲਾਹ',
                'weather': 'ਮੌਸਮ',
                'temperature': 'ਤਾਪਮਾਨ',
                'humidity': 'ਨਮੀ',
                'wind': 'ਹਵਾ ਦੀ ਗਤੀ',
                'precip': 'ਵਰਖਾ',
                'forecast': 'ਭਵਿੱਖਬਾਣੀ'
            },
            'te': {
                'advisory': 'సలహా',
                'weather': 'వాతావరణం',
                'temperature': 'ఉష్ణోగ్రత',
                'humidity': 'తేమ',
                'wind': 'గాలి వేగం',
                'precip': 'వర్షపాతం',
                'forecast': 'అనుమానం'
            },
            'ur': {
                'advisory': 'مشورہ',
                'weather': 'موسم',
                'temperature': 'درجہ حرارت',
                'humidity': 'نمی',
                'wind': 'ہوا کی رفتار',
                'precip': 'بارش',
                'forecast': 'پیشن گوئی'
            }
        }
        # Map language to code
        lang_map = {
            'english': 'en', 'en': 'en',
            'hindi': 'hi', 'hi': 'hi',
            'marathi': 'mr', 'mr': 'mr',
            'tamil': 'ta', 'ta': 'ta',
            'bengali': 'bn', 'bn': 'bn',
            'gujarati': 'gu', 'gu': 'gu',
            'kannada': 'kn', 'kn': 'kn',
            'malayalam': 'ml', 'ml': 'ml',
            'punjabi': 'pa', 'pa': 'pa',
            'telugu': 'te', 'te': 'te',
            'urdu': 'ur', 'ur': 'ur',
        }
        lang_code = lang_map.get(language.lower(), 'en')
        headers_list = [section_headers.get(lang_code, section_headers['en'])]
        if lang_code != 'en':
            headers_list.append(section_headers['en'])

        advisory = "No advisory found."
        weather = {}
        advisory_match = None
        weather_match = None
        matched_headers = None
        matched_weather_block = None
        matched_advisory_match = None
        for headers in headers_list:
            def fuzzy_header(header):
                # Allow for optional colon, whitespace, or line break after header
                return rf'{header}[\s\-:：]*'
            # More flexible: allow for optional colon, whitespace, or line break after header
            # Also allow for bullet points, numbered lists, and markdown formatting after header
            advisory_pattern = rf'{fuzzy_header(headers["advisory"])}[\s\-:：]*([\s\S]*?)(?=\n?{fuzzy_header(headers["weather"])}|$)'
            weather_pattern = rf'{fuzzy_header(headers["weather"])}[\s\-:：]*([\s\S]*)'
            advisory_match = re.search(advisory_pattern, text, re.IGNORECASE)
            weather_match = re.search(weather_pattern, text, re.IGNORECASE)
            print(f"[DEBUG] Trying headers: {headers}")
            print(f"[DEBUG] advisory_match: {advisory_match}")
            print(f"[DEBUG] weather_match: {weather_match}")
            if advisory_match or weather_match:
                matched_headers = headers
                # If weather_match is found but block is empty, fallback to all lines after header
                if weather_match:
                    block = weather_match.group(1)
                    if not block.strip():
                        # Find header position and take all lines after
                        header_pos = text.lower().find(headers["weather"].lower())
                        if header_pos != -1:
                            block = text[header_pos + len(headers["weather"]):].strip()
                    matched_weather_block = block
                else:
                    matched_weather_block = None
                matched_advisory_match = advisory_match
                break
        if matched_advisory_match:
            advisory_block = matched_advisory_match.group(1).strip()
        elif matched_headers and matched_weather_block:
            advisory_header = matched_headers["advisory"]
            weather_header = matched_headers["weather"]
            adv_pos = text.lower().find(advisory_header.lower())
            weather_pos = text.lower().find(weather_header.lower())
            if adv_pos != -1 and weather_pos != -1 and adv_pos < weather_pos:
                advisory_block = text[adv_pos + len(advisory_header):weather_pos].strip()
            else:
                advisory_block = text[:weather_pos].strip() if weather_pos != -1 else text.strip()
        else:
            advisory_block = ""

        # Always join all non-empty lines for all languages
        lines = [l.strip() for l in advisory_block.splitlines() if l.strip()]
        if len(lines) > 1:
            advisory = "\n".join(lines)
        elif len(lines) == 1:
            # If only one line, split by sentence-ending punctuation (handles Hindi, Bengali, etc.)
            split_regex = r'[।.!?;\n]+'
            sentences = re.split(split_regex, lines[0])
            sentences = [s.strip() for s in sentences if s.strip()]
            advisory = "\n".join(sentences) if sentences else lines[0]
        else:
            advisory = advisory_block
        # Robust extraction: Try all possible keywords for each field if not found with matched headers
        if matched_weather_block:
            weather_block = matched_weather_block
            lines = [l.strip() for l in weather_block.splitlines() if l.strip()]
            def find_line_with_keywords(keywords):
                for line in lines:
                    for keyword in keywords:
                        if keyword in line:
                            return line, keyword
                return None, None
            def extract_number_after_keyword(line, keyword):
                m = re.search(rf'{re.escape(keyword)}[\s\-:：]*([\d.]+)', line)
                if m:
                    return float(m.group(1))
                m = re.search(r':\s*([\d.]+)', line)
                return float(m.group(1)) if m else None
            def extract_text_after_keyword(line, keyword):
                m = re.search(rf'{re.escape(keyword)}[\s\-:：]*([^\n]+)', line)
                if m:
                    val = m.group(1).strip()
                    if val.startswith(':'):
                        val = val[1:].strip()
                    return val
                m = re.search(r':\s*(.*)', line)
                return m.group(1).strip() if m else line.strip()
            # Build all possible keywords for each field
            all_headers = list(section_headers.values())
            temp_keywords = [h["temperature"] for h in all_headers if "temperature" in h]
            humidity_keywords = [h["humidity"] for h in all_headers if "humidity" in h]
            wind_keywords = [h["wind"] for h in all_headers if "wind" in h]
            precip_keywords = [h["precip"] for h in all_headers if "precip" in h]
            forecast_keywords = [h["forecast"] for h in all_headers if "forecast" in h]
            # Try matched headers first, then all possible keywords
            temp_line, temp_kw = find_line_with_keywords([matched_headers["temperature"]] + temp_keywords)
            humidity_line, humidity_kw = find_line_with_keywords([matched_headers["humidity"]] + humidity_keywords)
            wind_line, wind_kw = find_line_with_keywords([matched_headers["wind"]] + wind_keywords)
            precip_line, precip_kw = find_line_with_keywords([matched_headers["precip"]] + precip_keywords)
            forecast_line, forecast_kw = find_line_with_keywords([matched_headers["forecast"]] + forecast_keywords)
            temp = extract_number_after_keyword(temp_line, temp_kw) if temp_line and temp_kw else None
            humidity = extract_number_after_keyword(humidity_line, humidity_kw) if humidity_line and humidity_kw else None
            wind = extract_number_after_keyword(wind_line, wind_kw) if wind_line and wind_kw else None
            precip = extract_text_after_keyword(precip_line, precip_kw) if precip_line and precip_kw else None
            forecast = extract_text_after_keyword(forecast_line, forecast_kw) if forecast_line and forecast_kw else None
            # Fallback: If still missing, try to extract first number or text from the block
            if temp is None:
                m = re.search(r'(\d{1,3}(\.\d+)?)\s*[°℃C]?', weather_block)
                temp = float(m.group(1)) if m else None
            if humidity is None:
                m = re.search(r'(\d{1,3}(\.\d+)?)\s*%?', weather_block)
                humidity = float(m.group(1)) if m else None
            if wind is None:
                m = re.search(r'(\d{1,3}(\.\d+)?)\s*(km/h|kmph|m/s)?', weather_block)
                wind = float(m.group(1)) if m else None
            if precip is None:
                m = re.search(r'(\w{2,20})', weather_block)
                precip = m.group(1) if m else None
            if forecast is None:
                m = re.search(r'(Rain|Cloud|Clear|Fog|Storm|Thunder|Sunny|Showers|Overcast|Drizzle|Snow|Haze|Windy)', weather_block, re.IGNORECASE)
                forecast = m.group(1) if m else None
            print(f"[DEBUG] temp: {temp}, humidity: {humidity}, wind: {wind}, precip: {precip}, forecast: {forecast}")
            weather = {
                "temperature": temp,
                "humidity": humidity,
                "windSpeed": wind,
                "precipitation": precip,
                "forecast": forecast
            }
        return {"advisory": advisory, "weather": weather}
    except Exception as e:
        print(f"[ERROR] Error generating climate advisory: {e}")
        return {"error": f"Failed to get climate advisory: {str(e)}"}
