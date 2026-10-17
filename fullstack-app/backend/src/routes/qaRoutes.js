import express from 'express';
import {
  getAllQa,
  getQaById,
  createQa,
  updateQa,
  deleteQa,
} from '../controllers/qaController.js';

const router = express.Router();

router.get('/', getAllQa);
router.get('/:id', getQaById);
router.post('/', createQa);
router.put('/:id', updateQa);
router.delete('/:id', deleteQa);

export default router;
