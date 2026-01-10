import logger from '../utils/logger.util';

interface NotificationPayload {
    room: string;
    event: string;
    data: any;
}

class NotificationService {
    private io: any = null;

    initialize(socketIO: any): void {
        this.io = socketIO;
        logger.info('✅ Notification service initialized with Socket.IO');
    }

    emit(payload: NotificationPayload): void {
        if (!this.io) {
            logger.warn('Socket.IO not initialized, notification not sent');
            return;
        }

        this.io.to(payload.room).emit(payload.event, payload.data);
        logger.info(`📡 Emitted ${payload.event} to room ${payload.room}`);
    }

    notifyEmergencyUpdate(emergencyId: string, data: any): void {
        this.emit({
            room: `emergency:${emergencyId}`,
            event: 'emergency:update',
            data
        });
    }

    notifyAmbulanceLocationUpdate(ambulanceId: string, location: any): void {
        this.emit({
            room: `ambulance:${ambulanceId}`,
            event: 'ambulance:location',
            data: location
        });
    }

    notifyDispatcherDashboard(data: any): void {
        this.emit({
            room: 'dispatcher:dashboard',
            event: 'dashboard:update',
            data
        });
    }

    notifyHospitalAlert(hospitalId: string, data: any): void {
        this.emit({
            room: `hospital:${hospitalId}`,
            event: 'hospital:alert',
            data
        });
    }
}

export default new NotificationService();
