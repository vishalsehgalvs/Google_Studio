import os
import base64
import io

try:
    import google.generativeai as genai
    from PIL import Image
    print("[DEBUG] google.generativeai and PIL.Image imported successfully.")
except ImportError as e:
    print(f"[ERROR] ImportError: {e}")
    genai = None
    Image = None

API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
print(f"[DEBUG] Using API_KEY: {API_KEY[:8]}...{'set' if API_KEY else 'NOT SET'}")

if genai and API_KEY:
    print("[DEBUG] Configuring genai with API_KEY.")
    genai.configure(api_key=API_KEY)
else:
    print("[ERROR] genai or API_KEY missing. genai:", genai, "API_KEY:", bool(API_KEY))

API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

if genai and API_KEY:
    genai.configure(api_key=API_KEY)


def analyze_crop_image(base64_image_str, language="English"):
    if not genai or not Image:
        print("[ERROR] Gemini AI or PIL not installed.")
        return None, "Gemini AI or PIL not installed."
    try:
        image_data = base64.b64decode(base64_image_str)
        print(f"[DEBUG] Decoded image data, length: {len(image_data)} bytes.")
        img = Image.open(io.BytesIO(image_data))
        print(f"[DEBUG] Image opened. Mode: {img.mode}, Size: {img.size}")
        if img.mode != 'RGB':
            img = img.convert('RGB')
            print("[DEBUG] Image converted to RGB.")
        image_part = img
    except Exception as e:
        print(f"[ERROR] Error loading image from base64 string: {e}")
        return None, f"Error loading image from base64 string: {e}"
    prompt_text = f"""
    Analyze this image of a crop field and return the answer in English language.
    Respond in the following format as plain text (not JSON, not Markdown):
    Crop Name: <name of the crop identified, always include this as the first field. If you cannot identify the crop, write 'Unknown'>
    Disease Identified: <concise summary of the disease or main issue identified>
    Remedies: <numbered list of actionable remedies or suggestions in a single line>
    Confidence Score: <a number between 0 and 1 representing your confidence in the diagnosis>
    Example:
    Crop Name: Chickpea
    Disease Identified: Cercospora leaf spot. This fungal disease is characterized by small, circular spots...
    Remedies: 1. Remove and destroy infected leaves. 2. Improve air circulation...
    Confidence Score: 0.9
    (Always include the 'Crop Name' field, even if you are not sure. If not sure, output 'Crop Name: Unknown')
    """
    contents = [image_part, prompt_text]
    try:
        print("[DEBUG] Calling Gemini model...")
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(contents)
        print(f"[DEBUG] Gemini response: {getattr(response, 'text', str(response))}")
        return response.text, None
    except Exception as e:
        print(f"[ERROR] Error generating content: {e}")
        return None, f"Error generating content: {e}"
