import express from 'express';
import { getMachinery, rentMachinery, addMachinery, updateMachinery, deleteMachinery } from '../controllers/machineryController.js';
const router = express.Router();

router.get('/', getMachinery);
router.post('/rent', rentMachinery);
router.post('/', addMachinery);
router.put('/:id', updateMachinery);
router.delete('/:id', deleteMachinery);

export default router;
