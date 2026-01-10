import axios from 'axios';
import { azureConfig } from '../config/azure';
import { Coordinates, calculateHaversineDistance } from '../utils/geospatial.util';
import { calculateETA, ETAResult } from '../utils/eta-calculator.util';
import logger from '../utils/logger.util';

interface RouteResult {
    distance: number;
    duration: number;
    geometry?: any;
}

class AzureMapsService {
    private subscriptionKey: string;
    private baseUrl = 'https://atlas.microsoft.com/route/directions/json';

    constructor() {
        this.subscriptionKey = azureConfig.maps.subscriptionKey;
    }

    async getRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResult> {
        if (!azureConfig.maps.enabled) {
            logger.warn('Azure Maps not configured, using Haversine fallback');
            return this.fallbackRoute(origin, destination);
        }

        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    'api-version': '1.0',
                    'subscription-key': this.subscriptionKey,
                    query: `${origin.latitude},${origin.longitude}:${destination.latitude},${destination.longitude}`,
                    travelMode: 'car',
                    traffic: true
                },
                timeout: 5000
            });

            const route = response.data.routes[0];
            const summary = route.summary;

            return {
                distance: summary.lengthInMeters / 1000, // Convert to km
                duration: Math.ceil(summary.travelTimeInSeconds / 60), // Convert to minutes
                geometry: route.legs[0].points
            };

        } catch (error) {
            logger.error('Azure Maps API error, using fallback:', error);
            return this.fallbackRoute(origin, destination);
        }
    }

    async calculateDistance(origin: Coordinates, destination: Coordinates): Promise<number> {
        if (!azureConfig.maps.enabled) {
            return calculateHaversineDistance(origin, destination);
        }

        try {
            const route = await this.getRoute(origin, destination);
            return route.distance;
        } catch (error) {
            logger.error('Distance calculation error, using Haversine:', error);
            return calculateHaversineDistance(origin, destination);
        }
    }

    async calculateETA(origin: Coordinates, destination: Coordinates): Promise<ETAResult> {
        try {
            if (azureConfig.maps.enabled) {
                const route = await this.getRoute(origin, destination);
                const estimatedArrival = new Date();
                estimatedArrival.setMinutes(estimatedArrival.getMinutes() + route.duration);

                return {
                    distanceKm: route.distance,
                    durationMinutes: route.duration,
                    estimatedArrival
                };
            }
        } catch (error) {
            logger.error('Azure Maps ETA error, using fallback:', error);
        }

        return calculateETA(origin, destination);
    }

    private fallbackRoute(origin: Coordinates, destination: Coordinates): RouteResult {
        const distance = calculateHaversineDistance(origin, destination);
        const eta = calculateETA(origin, destination);

        return {
            distance,
            duration: eta.durationMinutes
        };
    }
}

export default new AzureMapsService();
