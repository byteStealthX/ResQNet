import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Emergency from '../models/Emergency';
import Ambulance from '../models/Ambulance';
import Hospital from '../models/Hospital';
import User from '../models/User';
import logger from '../utils/logger.util';

class AdminController {
    async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            const [
                totalEmergencies,
                activeEmergencies,
                totalAmbulances,
                availableAmbulances,
                totalHospitals,
                totalUsers
            ] = await Promise.all([
                Emergency.countDocuments(),
                Emergency.countDocuments({ status: { $in: ['reported', 'triaged', 'dispatched', 'en_route', 'on_scene', 'transporting'] } }),
                Ambulance.countDocuments({ isOperational: true }),
                Ambulance.countDocuments({ status: 'available', isOperational: true }),
                Hospital.countDocuments({ isOperational: true }),
                User.countDocuments({ isActive: true })
            ]);

            const emergenciesByType = await Emergency.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);

            const emergenciesBySeverity = await Emergency.aggregate([
                { $group: { _id: '$severity', count: { $sum: 1 } } }
            ]);

            res.json({
                stats: {
                    totalEmergencies,
                    activeEmergencies,
                    totalAmbulances,
                    availableAmbulances,
                    totalHospitals,
                    totalUsers,
                    emergenciesByType,
                    emergenciesBySeverity
                }
            });
        } catch (error) {
            logger.error('Get dashboard stats error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getSystemHealth(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ambulanceUtilization = await Ambulance.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const hospitalCapacity = await Hospital.aggregate([
                {
                    $group: {
                        _id: null,
                        totalBeds: { $sum: '$capacity.totalBeds' },
                        availableBeds: { $sum: '$capacity.availableBeds' },
                        totalICUBeds: { $sum: '$capacity.icuBeds' },
                        availableICUBeds: { $sum: '$capacity.availableICUBeds' }
                    }
                }
            ]);

            const averageResponseTime = await Emergency.aggregate([
                {
                    $match: {
                        'timeline.dispatched': { $exists: true },
                        'timeline.arrivedOnScene': { $exists: true }
                    }
                },
                {
                    $project: {
                        responseTime: {
                            $subtract: ['$timeline.arrivedOnScene', '$timeline.dispatched']
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgResponseTime: { $avg: '$responseTime' }
                    }
                }
            ]);

            res.json({
                health: {
                    ambulanceUtilization,
                    hospitalCapacity: hospitalCapacity[0] || {},
                    averageResponseTimeMinutes: averageResponseTime[0]?.avgResponseTime ? Math.round(averageResponseTime[0].avgResponseTime / 60000) : null
                }
            });
        } catch (error) {
            logger.error('Get system health error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}

export default new AdminController();
