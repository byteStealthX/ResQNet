import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Ambulance, { AmbulanceStatus } from '../models/Ambulance';
import notificationService from '../services/notification.service';
import logger from '../utils/logger.util';

class AmbulanceController {
    async getAmbulances(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { status, type } = req.query;
            const filter: any = { isOperational: true };

            if (status) filter.status = status;
            if (type) filter.type = type;

            const ambulances = await Ambulance.find(filter)
                .populate('equipment')
                .populate('currentEmergencyId')
                .sort({ number: 1 });

            res.json({ ambulances, count: ambulances.length });
        } catch (error) {
            logger.error('Get ambulances error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getAmbulanceById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ambulance = await Ambulance.findById(req.params.id)
                .populate('equipment')
                .populate('currentEmergencyId');

            if (!ambulance) {
                res.status(404).json({ error: 'Ambulance not found' });
                return;
            }

            res.json({ ambulance: ambulance.toObject() });
        } catch (error) {
            logger.error('Get ambulance error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async updateLocation(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { latitude, longitude } = req.body;
            const ambulance = await Ambulance.findById(req.params.id);

            if (!ambulance) {
                res.status(404).json({ error: 'Ambulance not found' });
                return;
            }

            ambulance.currentLocation = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };

            await ambulance.save();

            notificationService.notifyAmbulanceLocationUpdate(ambulance._id.toString(), {
                latitude,
                longitude,
                timestamp: new Date()
            });

            if (ambulance.currentEmergencyId) {
                notificationService.notifyEmergencyUpdate(ambulance.currentEmergencyId.toString(), {
                    ambulanceLocation: { latitude, longitude }
                });
            }

            res.json({ message: 'Location updated', ambulance: ambulance.toObject() });
        } catch (error) {
            logger.error('Update location error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async updateStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { status } = req.body;
            const ambulance = await Ambulance.findById(req.params.id);

            if (!ambulance) {
                res.status(404).json({ error: 'Ambulance not found' });
                return;
            }

            ambulance.status = status;

            if (status === AmbulanceStatus.AVAILABLE) {
                ambulance.currentEmergencyId = undefined;
                ambulance.assignedHospitalId = undefined;
            }

            await ambulance.save();

            res.json({ message: 'Status updated', ambulance: ambulance.toObject() });
        } catch (error) {
            logger.error('Update ambulance status error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getNearby(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { latitude, longitude, maxDistance = 10 } = req.query;

            const ambulances = await Ambulance.find({
                currentLocation: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: Number(maxDistance) * 1000
                    }
                },
                status: AmbulanceStatus.AVAILABLE,
                isOperational: true
            }).limit(10);

            res.json({ ambulances, count: ambulances.length });
        } catch (error) {
            logger.error('Get nearby ambulances error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}

export default new AmbulanceController();
