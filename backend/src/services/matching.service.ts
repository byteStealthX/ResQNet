import Ambulance, { AmbulanceStatus, IAmbulance } from '../models/Ambulance';
import Hospital, { IHospital } from '../models/Hospital';
import { EmergencySeverity } from '../models/Emergency';
import { Coordinates, calculateHaversineDistance } from '../utils/geospatial.util';
import azureMapsService from './azure-maps.service';
import logger from '../utils/logger.util';

interface MatchingInput {
    emergencyLocation: Coordinates;
    severity: EmergencySeverity;
    requiredResources: string[];
    emergencyType: string;
}

interface AmbulanceScore {
    ambulance: IAmbulance;
    score: number;
    distance: number;
}

interface HospitalScore {
    hospital: IHospital;
    score: number;
    distance: number;
}

interface MatchingResult {
    ambulance: IAmbulance | null;
    hospital: IHospital | null;
    ambulanceDistance: number;
    hospitalDistance: number;
    totalScore: number;
}

class MatchingService {
    async findBestMatch(input: MatchingInput): Promise<MatchingResult> {
        logger.info('Starting Golden Triangle matching algorithm');

        const [ambulanceMatch, hospitalMatch] = await Promise.all([
            this.findBestAmbulance(input),
            this.findBestHospital(input)
        ]);

        if (!ambulanceMatch || !hospitalMatch) {
            logger.warn('No suitable ambulance or hospital found');
            return {
                ambulance: ambulanceMatch?.ambulance || null,
                hospital: hospitalMatch?.hospital || null,
                ambulanceDistance: ambulanceMatch?.distance || 0,
                hospitalDistance: hospitalMatch?.distance || 0,
                totalScore: 0
            };
        }

        const totalScore = (ambulanceMatch.score + hospitalMatch.score) / 2;

        logger.info(`Match found: Ambulance ${ambulanceMatch.ambulance.number}, Hospital ${hospitalMatch.hospital.name}, Score: ${totalScore.toFixed(2)}`);

        return {
            ambulance: ambulanceMatch.ambulance,
            hospital: hospitalMatch.hospital,
            ambulanceDistance: ambulanceMatch.distance,
            hospitalDistance: hospitalMatch.distance,
            totalScore
        };
    }

    private async findBestAmbulance(input: MatchingInput): Promise<AmbulanceScore | null> {
        const availableAmbulances = await Ambulance.find({
            status: AmbulanceStatus.AVAILABLE,
            isOperational: true
        }).populate('equipment');

        if (availableAmbulances.length === 0) {
            logger.warn('No available ambulances');
            return null;
        }

        const scoredAmbulances: AmbulanceScore[] = [];

        for (const ambulance of availableAmbulances) {
            const ambulanceCoords: Coordinates = {
                latitude: ambulance.currentLocation.coordinates[1],
                longitude: ambulance.currentLocation.coordinates[0]
            };

            const distance = calculateHaversineDistance(ambulanceCoords, input.emergencyLocation);

            const distanceScore = this.calculateDistanceScore(distance);
            const typeScore = this.calculateAmbulanceTypeScore(ambulance.type, input.severity);
            const equipmentScore = this.calculateEquipmentScore(ambulance, input.requiredResources);

            const totalScore = (distanceScore * 0.5) + (typeScore * 0.3) + (equipmentScore * 0.2);

            scoredAmbulances.push({
                ambulance,
                score: totalScore,
                distance
            });
        }

        scoredAmbulances.sort((a, b) => b.score - a.score);

        return scoredAmbulances[0] || null;
    }

    private async findBestHospital(input: MatchingInput): Promise<HospitalScore | null> {
        const hospitals = await Hospital.find({
            isOperational: true,
            acceptingEmergencies: true,
            'capacity.availableEmergencyBeds': { $gt: 0 }
        }).populate('resources');

        if (hospitals.length === 0) {
            logger.warn('No available hospitals');
            return null;
        }

        const scoredHospitals: HospitalScore[] = [];

        for (const hospital of hospitals) {
            const hospitalCoords: Coordinates = {
                latitude: hospital.location.coordinates[1],
                longitude: hospital.location.coordinates[0]
            };

            const distance = calculateHaversineDistance(hospitalCoords, input.emergencyLocation);

            const distanceScore = this.calculateDistanceScore(distance);
            const capacityScore = this.calculateCapacityScore(hospital, input.severity);
            const resourceScore = this.calculateHospitalResourceScore(hospital, input.requiredResources);
            const specializationScore = this.calculateSpecializationScore(hospital, input.emergencyType);

            const totalScore = (distanceScore * 0.35) + (capacityScore * 0.25) + (resourceScore * 0.20) + (specializationScore * 0.20);

            scoredHospitals.push({
                hospital,
                score: totalScore,
                distance
            });
        }

        scoredHospitals.sort((a, b) => b.score - a.score);

        return scoredHospitals[0] || null;
    }

    private calculateDistanceScore(distance: number): number {
        if (distance <= 2) return 100;
        if (distance <= 5) return 90;
        if (distance <= 10) return 70;
        if (distance <= 20) return 50;
        if (distance <= 30) return 30;
        return 10;
    }

    private calculateAmbulanceTypeScore(type: string, severity: EmergencySeverity): number {
        if (severity === EmergencySeverity.CRITICAL) {
            return type === 'ALS' || type === 'CCT' ? 100 : 60;
        }
        if (severity === EmergencySeverity.HIGH) {
            return type === 'ALS' ? 100 : type === 'BLS' ? 80 : 60;
        }
        return 80;
    }

    private calculateEquipmentScore(ambulance: IAmbulance, requiredResources: string[]): number {
        if (!requiredResources || requiredResources.length === 0) return 80;

        const hasEquipment = ambulance.equipment && ambulance.equipment.length > 0;
        return hasEquipment ? 100 : 50;
    }

    private calculateCapacityScore(hospital: IHospital, severity: EmergencySeverity): number {
        const capacityRatio = hospital.capacity.availableEmergencyBeds / hospital.capacity.emergencyBeds;
        const icuRatio = hospital.capacity.availableICUBeds / hospital.capacity.icuBeds;

        if (severity === EmergencySeverity.CRITICAL) {
            if (hospital.capacity.availableICUBeds === 0) return 20;
            return icuRatio > 0.3 ? 100 : 70;
        }

        if (capacityRatio > 0.5) return 100;
        if (capacityRatio > 0.2) return 70;
        return 40;
    }

    private calculateHospitalResourceScore(hospital: IHospital, requiredResources: string[]): number {
        if (!requiredResources || requiredResources.length === 0) return 80;

        const hasResources = hospital.resources && hospital.resources.length > 0;
        return hasResources ? 100 : 50;
    }

    private calculateSpecializationScore(hospital: IHospital, emergencyType: string): number {
        if (!hospital.specializations || hospital.specializations.length === 0) return 70;

        const relevantSpecialization = hospital.specializations.some(spec =>
            spec.toLowerCase().includes(emergencyType.toLowerCase())
        );

        return relevantSpecialization ? 100 : 70;
    }
}

export default new MatchingService();
