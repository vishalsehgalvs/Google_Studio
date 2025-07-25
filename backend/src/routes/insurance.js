import express from 'express';
import { getInsuranceInfo } from '../controllers/insuranceController.js';
const router = express.Router();

router.get('/', getInsuranceInfo);

export default router;
