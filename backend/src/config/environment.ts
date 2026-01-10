import dotenv from 'dotenv';

dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    apiVersion: process.env.API_VERSION || 'v1',

    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/resqnet'
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'change_this_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    azure: {
        openai: {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            apiKey: process.env.AZURE_OPENAI_API_KEY || '',
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4'
        },
        maps: {
            subscriptionKey: process.env.AZURE_MAPS_SUBSCRIPTION_KEY || ''
        },
        communication: {
            connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '',
            phoneNumber: process.env.AZURE_COMMUNICATION_PHONE_NUMBER || ''
        },
        webPubSub: {
            connectionString: process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING || ''
        }
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    },

    socketIO: {
        enabled: process.env.SOCKET_IO_ENABLED === 'true'
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};

export default config;
