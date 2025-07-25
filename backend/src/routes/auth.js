import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateJWT } from '../services/authService.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateJWT, getProfile);

export default router;
