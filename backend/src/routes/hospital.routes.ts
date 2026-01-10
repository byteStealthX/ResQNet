import { Router } from 'express';
import hospitalController from '../controllers/hospital.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', hospitalController.getHospitals);
router.get('/nearby', hospitalController.getNearby);
router.get('/:id', hospitalController.getHospitalById);
router.patch('/:id/capacity', requireRole([UserRole.HOSPITAL_ADMIN, UserRole.ADMIN]), hospitalController.updateCapacity);

export default router;
