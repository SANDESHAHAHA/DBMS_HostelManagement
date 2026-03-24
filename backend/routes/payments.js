import express from 'express';
import { addPayment, getPayments, updatePaymentStatus, updatePayment, deletePayment } from '../controllers/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', addPayment);
router.get('/', getPayments);
router.patch('/:id/status', updatePaymentStatus);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;
