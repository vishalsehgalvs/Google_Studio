import express from 'express';
import { getSoilRecommendations } from '../controllers/soilController.js';
const router = express.Router();

router.get('/', getSoilRecommendations);

export default router;
