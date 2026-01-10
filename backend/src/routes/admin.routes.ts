import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(requireRole([UserRole.ADMIN]));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/system/health', adminController.getSystemHealth);

export default router;
