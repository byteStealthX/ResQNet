import { calculateHaversineDistance, Coordinates } from './geospatial.util';

export interface ETAResult {
    distanceKm: number;
    durationMinutes: number;
    estimatedArrival: Date;
}

const AVERAGE_SPEED_KMH = 40; // Average ambulance speed in urban areas
const TRAFFIC_MULTIPLIER = 1.3; // Traffic adjustment factor

export const calculateETA = (
    origin: Coordinates,
    destination: Coordinates,
    trafficFactor: number = TRAFFIC_MULTIPLIER
): ETAResult => {
    const distanceKm = calculateHaversineDistance(origin, destination);
    const durationHours = (distanceKm / AVERAGE_SPEED_KMH) * trafficFactor;
    const durationMinutes = Math.ceil(durationHours * 60);

    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + durationMinutes);

    return {
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        durationMinutes,
        estimatedArrival
    };
};

export default calculateETA;
