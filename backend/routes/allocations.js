import express from 'express';
import { allocateRoom, getAllocations, updateAllocation, removeAllocation } from '../controllers/allocationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', allocateRoom);
router.get('/', getAllocations);
router.put('/:id', updateAllocation);
router.delete('/:id', removeAllocation);

export default router;
