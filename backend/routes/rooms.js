import express from 'express';
import { addRoom, getRooms, updateRoom, deleteRoom } from '../controllers/roomController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', addRoom);
router.get('/', getRooms);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
