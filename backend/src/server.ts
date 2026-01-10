import express, { Application } from 'express';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDatabase from './config/database';
import { config } from './config/environment';
import logger from './utils/logger.util';
import notificationService from './services/notification.service';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import emergencyRoutes from './routes/emergency.routes';
import ambulanceRoutes from './routes/ambulance.routes';
import hospitalRoutes from './routes/hospital.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();
const httpServer = new HTTPServer(app);

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: config.cors.origin,
        credentials: true
    }
});

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'ResQNet API',
        version: config.apiVersion,
        environment: config.nodeEnv
    });
});

app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/emergencies`, emergencyRoutes);
app.use(`/api/${config.apiVersion}/ambulances`, ambulanceRoutes);
app.use(`/api/${config.apiVersion}/hospitals`, hospitalRoutes);
app.use(`/api/${config.apiVersion}/admin`, adminRoutes);

io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join:emergency', (emergencyId: string) => {
        socket.join(`emergency:${emergencyId}`);
        logger.info(`Socket ${socket.id} joined emergency:${emergencyId}`);
    });

    socket.on('join:ambulance', (ambulanceId: string) => {
        socket.join(`ambulance:${ambulanceId}`);
        logger.info(`Socket ${socket.id} joined ambulance:${ambulanceId}`);
    });

    socket.on('join:dispatcher', () => {
        socket.join('dispatcher:dashboard');
        logger.info(`Socket ${socket.id} joined dispatcher dashboard`);
    });

    socket.on('join:hospital', (hospitalId: string) => {
        socket.join(`hospital:${hospitalId}`);
        logger.info(`Socket ${socket.id} joined hospital:${hospitalId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

notificationService.initialize(io);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();

        httpServer.listen(config.port, () => {
            logger.info(`🚀 ResQNet API Server running on port ${config.port}`);
            logger.info(`📍 Environment: ${config.nodeEnv}`);
            logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
            logger.info(`📡 Socket.IO enabled`);
            logger.info(`🌐 API Base: http://localhost:${config.port}/api/${config.apiVersion}`);
        });
    } catch (error) {
        logger.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
