import azureMapsService from './azure-maps.service';
import { Coordinates } from '../utils/geospatial.util';
import { calculateETA, ETAResult } from '../utils/eta-calculator.util';
import logger from '../utils/logger.util';

interface RouteRequest {
    origin: Coordinates;
    destination: Coordinates;
}

class RoutingService {
    async getRoute(request: RouteRequest): Promise<ETAResult> {
        try {
            const eta = await azureMapsService.calculateETA(request.origin, request.destination);
            logger.info(`Route calculated: ${eta.distanceKm}km, ${eta.durationMinutes} minutes`);
            return eta;
        } catch (error) {
            logger.error('Routing error:', error);
            return calculateETA(request.origin, request.destination);
        }
    }

    async calculateMultiPointRoute(points: Coordinates[]): Promise<number> {
        if (points.length < 2) return 0;

        let totalDuration = 0;

        for (let i = 0; i < points.length - 1; i++) {
            const eta = await this.getRoute({
                origin: points[i],
                destination: points[i + 1]
            });
            totalDuration += eta.durationMinutes;
        }

        return totalDuration;
    }
}

export default new RoutingService();
