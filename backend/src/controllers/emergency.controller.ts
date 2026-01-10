import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Emergency, { EmergencyType, EmergencySeverity, EmergencyStatus } from '../models/Emergency';
import Ambulance, { AmbulanceStatus } from '../models/Ambulance';
import Hospital from '../models/Hospital';
import aiTriageService from '../services/ai-triage.service';
import matchingService from '../services/matching.service';
import routingService from '../services/routing.service';
import azureCommunicationService from '../services/azure-communication.service';
import notificationService from '../services/notification.service';
import logger from '../utils/logger.util';
import Joi from 'joi';

const createEmergencySchema = Joi.object({
    type: Joi.string().valid(...Object.values(EmergencyType)).required(),
    description: Joi.string().required(),
    location: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    address: Joi.string().required(),
    patientInfo: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(0).max(150).required(),
        gender: Joi.string().required(),
        phone: Joi.string().required(),
        medicalHistory: Joi.array().items(Joi.string()).optional(),
        allergies: Joi.array().items(Joi.string()).optional(),
        currentMedications: Joi.array().items(Joi.string()).optional()
    }).required(),
    vitals: Joi.object({
        heartRate: Joi.number().optional(),
        bloodPressure: Joi.string().optional(),
        respiratoryRate: Joi.number().optional(),
        temperature: Joi.number().optional(),
        oxygenSaturation: Joi.number().optional()
    }).optional(),
    requiredResources: Joi.array().items(Joi.string()).optional()
});

class EmergencyController {
    async createEmergency(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { error } = createEmergencySchema.validate(req.body);
            if (error) {
                res.status(400).json({ error: 'Validation Error', message: error.details[0].message });
                return;
            }

            const { type, description, location, address, patientInfo, vitals, requiredResources } = req.body;

            logger.info(`Creating emergency: ${type} at ${location.latitude}, ${location.longitude}`);

            // Step 1: Create emergency record
            const emergency = await Emergency.create({
                reporterId: req.user!._id,
                type,
                description,
                location: {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude]
                },
                address,
                patientInfo,
                vitals,
                requiredResources: requiredResources || [],
                severity: EmergencySeverity.MEDIUM,
                status: EmergencyStatus.REPORTED,
                timeline: { reported: new Date() }
            });

            // Step 2: AI Triage
            const triageResult = await aiTriageService.triageEmergency({
                type,
                description,
                patientInfo,
                vitals
            });

            emergency.aiTriage = triageResult;
            emergency.severity = triageResult.severity;
            emergency.status = EmergencyStatus.TRIAGED;
            emergency.timeline.triaged = new Date();
            await emergency.save();

            logger.info(`Triage complete: Severity=${triageResult.severity}, Confidence=${triageResult.confidence}`);

            // Step 3: Golden Triangle Matching
            const match = await matchingService.findBestMatch({
                emergencyLocation: location,
                severity: emergency.severity,
                requiredResources: emergency.requiredResources,
                emergencyType: type
            });

            if (!match.ambulance || !match.hospital) {
                logger.warn('No suitable ambulance or hospital found');
                res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'No available ambulance or hospital found',
                    emergency: emergency.toObject()
                });
                return;
            }

            // Step 4: Assign Resources
            emergency.assignedAmbulanceId = match.ambulance._id;
            emergency.assignedHospitalId = match.hospital._id;
            emergency.status = EmergencyStatus.DISPATCHED;
            emergency.timeline.dispatched = new Date();

            // Calculate ETAs
            const ambulanceLocation = {
                latitude: match.ambulance.currentLocation.coordinates[1],
                longitude: match.ambulance.currentLocation.coordinates[0]
            };

            const hospitalLocation = {
                latitude: match.hospital.location.coordinates[1],
                longitude: match.hospital.location.coordinates[0]
            };

            const [ambulanceETA, sceneToHospitalETA] = await Promise.all([
                routingService.getRoute({ origin: ambulanceLocation, destination: location }),
                routingService.getRoute({ origin: location, destination: hospitalLocation })
            ]);

            emergency.eta = {
                ambulanceToScene: ambulanceETA.durationMinutes,
                sceneToHospital: sceneToHospitalETA.durationMinutes
            };

            await emergency.save();

            // Update ambulance status
            match.ambulance.status = AmbulanceStatus.EN_ROUTE;
            match.ambulance.currentEmergencyId = emergency._id;
            match.ambulance.assignedHospitalId = match.hospital._id;
            await match.ambulance.save();

            // Update hospital capacity
            match.hospital.capacity.availableEmergencyBeds -= 1;
            if (emergency.severity === EmergencySeverity.CRITICAL) {
                match.hospital.capacity.availableICUBeds -= 1;
            }
            await match.hospital.save();

            logger.info(`Emergency dispatched: Ambulance=${match.ambulance.number}, Hospital=${match.hospital.name}`);

            // Step 5: Send Notifications
            await Promise.all([
                azureCommunicationService.notifyAmbulanceAssignment(
                    match.ambulance.crew.paramedic,
                    emergency._id.toString(),
                    address
                ),
                azureCommunicationService.notifyHospitalAlert(
                    match.hospital.contact.emergencyLine,
                    `${patientInfo.name}, ${patientInfo.age}yo, ${type}`,
                    ambulanceETA.durationMinutes + sceneToHospitalETA.durationMinutes
                ),
                azureCommunicationService.notifyPatientUpdate(
                    patientInfo.phone,
                    `Ambulance ${match.ambulance.number} dispatched. ETA: ${ambulanceETA.durationMinutes} minutes`
                )
            ]);

            // Step 6: Real-time Updates
            notificationService.notifyEmergencyUpdate(emergency._id.toString(), {
                status: emergency.status,
                ambulance: match.ambulance.number,
                hospital: match.hospital.name,
                eta: emergency.eta
            });

            notificationService.notifyDispatcherDashboard({
                type: 'new_emergency',
                emergency: emergency.toObject()
            });

            res.status(201).json({
                message: 'Emergency created and dispatched successfully',
                emergency: emergency.toObject(),
                ambulance: match.ambulance.toObject(),
                hospital: match.hospital.toObject(),
                eta: emergency.eta
            });
        } catch (error) {
            logger.error('Create emergency error:', error);
            res.status(500).json({ error: 'Server Error', message: 'Failed to create emergency' });
        }
    }

    async getEmergencies(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { status, severity, type } = req.query;
            const filter: any = {};

            if (status) filter.status = status;
            if (severity) filter.severity = severity;
            if (type) filter.type = type;

            const emergencies = await Emergency.find(filter)
                .populate('reporterId', 'firstName lastName phone')
                .populate('assignedAmbulanceId')
                .populate('assignedHospitalId')
                .sort({ createdAt: -1 });

            res.json({ emergencies, count: emergencies.length });
        } catch (error) {
            logger.error('Get emergencies error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getEmergencyById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const emergency = await Emergency.findById(req.params.id)
                .populate('reporterId', 'firstName lastName phone')
                .populate('assignedAmbulanceId')
                .populate('assignedHospitalId');

            if (!emergency) {
                res.status(404).json({ error: 'Emergency not found' });
                return;
            }

            res.json({ emergency: emergency.toObject() });
        } catch (error) {
            logger.error('Get emergency error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async updateEmergencyStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { status } = req.body;
            const emergency = await Emergency.findById(req.params.id);

            if (!emergency) {
                res.status(404).json({ error: 'Emergency not found' });
                return;
            }

            emergency.status = status;

            if (status === EmergencyStatus.ON_SCENE) {
                emergency.timeline.arrivedOnScene = new Date();
            } else if (status === EmergencyStatus.TRANSPORTING) {
                emergency.timeline.departedToHospital = new Date();
            } else if (status === EmergencyStatus.AT_HOSPITAL) {
                emergency.timeline.arrivedAtHospital = new Date();
            } else if (status === EmergencyStatus.COMPLETED) {
                emergency.timeline.completed = new Date();
            }

            await emergency.save();

            notificationService.notifyEmergencyUpdate(emergency._id.toString(), {
                status: emergency.status,
                timeline: emergency.timeline
            });

            res.json({ message: 'Status updated', emergency: emergency.toObject() });
        } catch (error) {
            logger.error('Update status error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }

    async getMyEmergencies(req: AuthRequest, res: Response): Promise<void> {
        try {
            const emergencies = await Emergency.find({ reporterId: req.user!._id })
                .populate('assignedAmbulanceId')
                .populate('assignedHospitalId')
                .sort({ createdAt: -1 });

            res.json({ emergencies, count: emergencies.length });
        } catch (error) {
            logger.error('Get my emergencies error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}

export default new EmergencyController();
