import express from 'express';
import { getMarketPrices } from '../controllers/marketController.js';
const router = express.Router();

router.get('/', getMarketPrices);

export default router;
