import { Router } from 'express';
import ambulanceController from '../controllers/ambulance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', ambulanceController.getAmbulances);
router.get('/nearby', ambulanceController.getNearby);
router.get('/:id', ambulanceController.getAmbulanceById);
router.patch('/:id/location', requireRole([UserRole.PARAMEDIC, UserRole.ADMIN]), ambulanceController.updateLocation);
router.patch('/:id/status', requireRole([UserRole.PARAMEDIC, UserRole.ADMIN]), ambulanceController.updateStatus);

export default router;
