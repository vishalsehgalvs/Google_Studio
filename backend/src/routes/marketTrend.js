import express from 'express';
import axios from 'axios';
const router = express.Router();

// Proxy POST /api/market-trend to Flask
router.post('/', async (req, res) => {
  try {
    const flaskUrl = 'http://localhost:5000/api/market-trend';
    const flaskRes = await axios.post(flaskUrl, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.status(flaskRes.status).json(flaskRes.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

export default router;
