import express from 'express';
import { getFabrics, getFabricByHanger, addFabric } from '../controllers/fabricController.js';

const router = express.Router();

router.get('/', getFabrics);
router.get('/:hanger_number', getFabricByHanger);
router.post('/', addFabric);

export default router;