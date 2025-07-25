
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
export const diagnoseCrop = async (req, res) => {
  console.log('[DEBUG] diagnoseCrop called. req.file:', req.file ? req.file.originalname : null, 'req.body:', req.body);
  if (!req.file) {
    console.log('[ERROR] No image uploaded');
    return res.status(400).json({ success: false, error: 'No image uploaded' });
  }
  const language = req.body.language || 'English';
  try {
    // Read the uploaded image file as a buffer
    const imageBuffer = fs.readFileSync(req.file.path);
    console.log('[DEBUG] Read image buffer, size:', imageBuffer.length);
    const formData = new FormData();
    formData.append('image', imageBuffer, req.file.originalname);
    formData.append('language', language);

    // Remove the uploaded file immediately after reading
    fs.unlink(req.file.path, () => { console.log('[DEBUG] Temp file deleted:', req.file.path); });

    // Call the Python diagnosis API
    console.log('[DEBUG] Calling Flask API at http://127.0.0.1:5001/diagnose...');
    const response = await axios.post('http://127.0.0.1:5001/diagnose', formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });
    console.log('[DEBUG] Flask API response:', response.status, response.data);
    if (response.data && response.data.result) {
      res.json({ success: true, diagnosis: response.data.result });
    } else {
      res.status(500).json({ success: false, error: 'No result from diagnosis service', flaskResponse: response.data });
    }
  } catch (error) {
    // Try to remove the file if it still exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => { console.log('[DEBUG] Temp file deleted after error:', req.file.path); });
    }
    console.error('[ERROR] diagnoseCrop exception:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
};
