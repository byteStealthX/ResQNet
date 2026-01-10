import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Hospital from '../models/Hospital';
import logger from '../utils/logger.util';

class HospitalController {
    async getHospitals(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { acceptingEmergencies, traumaLevel } = req.query;
            const filter: any = { isOperational: true };

            if (acceptingEmergencies !== undefined) {
                filter.acceptingEmergencies = acceptingEmergencies === 'true';
            }
            if (traumaLevel) filter.traumaLevel = Number(traumaLevel);

            const hospitals = await Hospital.find(filter)
                .populate('resources')
                .sort({ name: 1 });

            res.json({ hospitals, count: hospitals.length });
        } catch (error) {
            logger.error('Get hospitals error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getHospitalById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const hospital = await Hospital.findById(req.params.id).populate('resources');

            if (!hospital) {
                res.status(404).json({ error: 'Hospital not found' });
                return;
            }

            res.json({ hospital: hospital.toObject() });
        } catch (error) {
            logger.error('Get hospital error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async updateCapacity(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { capacity } = req.body;
            const hospital = await Hospital.findById(req.params.id);

            if (!hospital) {
                res.status(404).json({ error: 'Hospital not found' });
                return;
            }

            Object.assign(hospital.capacity, capacity);
            await hospital.save();

            res.json({ message: 'Capacity updated', hospital: hospital.toObject() });
        } catch (error) {
            logger.error('Update capacity error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getNearby(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { latitude, longitude, maxDistance = 20 } = req.query;

            const hospitals = await Hospital.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: Number(maxDistance) * 1000
                    }
                },
                isOperational: true,
                acceptingEmergencies: true
            }).limit(10);

            res.json({ hospitals, count: hospitals.length });
        } catch (error) {
            logger.error('Get nearby hospitals error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}

export default new HospitalController();
