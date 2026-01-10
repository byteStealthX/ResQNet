import mongoose from 'mongoose';
import { config } from './environment';
import logger from '../utils/logger.util';

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(config.mongodb.uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info('✅ MongoDB/Cosmos DB connection established successfully');

        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        logger.error('❌ Unable to connect to database:', error);
        process.exit(1);
    }
};

export default connectDatabase;
