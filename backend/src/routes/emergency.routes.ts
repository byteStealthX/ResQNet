import { Router } from 'express';
import emergencyController from '../controllers/emergency.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/', emergencyController.createEmergency);
router.get('/', requireRole([UserRole.ADMIN, UserRole.PARAMEDIC, UserRole.HOSPITAL_ADMIN]), emergencyController.getEmergencies);
router.get('/my', emergencyController.getMyEmergencies);
router.get('/:id', emergencyController.getEmergencyById);
router.patch('/:id/status', requireRole([UserRole.ADMIN, UserRole.PARAMEDIC]), emergencyController.updateEmergencyStatus);

export default router;
