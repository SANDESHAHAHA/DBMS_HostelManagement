import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/metrics', getDashboardMetrics);

export default router;
