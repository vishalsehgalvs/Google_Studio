import express from 'express';
import { getSchemes } from '../controllers/schemesController.js';
const router = express.Router();

router.get('/', getSchemes);

export default router;
