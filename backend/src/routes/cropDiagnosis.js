import express from 'express';
import { diagnoseCrop } from '../controllers/cropDiagnosisController.js';
import multer from 'multer';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', (req, res, next) => {
  console.log('[DEBUG] /api/crop-diagnosis route hit');
  next();
}, upload.single('image'), diagnoseCrop);

export default router;
