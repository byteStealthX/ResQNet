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
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
    },

    azure: {
        openai: {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            apiKey: process.env.AZURE_OPENAI_API_KEY || '',
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
            enabled: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY)
        },
        entraId: {
            tenantId: process.env.AZURE_ENTRA_ID_TENANT_ID || '',
            clientId: process.env.AZURE_ENTRA_ID_CLIENT_ID || '',
            clientSecret: process.env.AZURE_ENTRA_ID_CLIENT_SECRET || '',
            authority: process.env.AZURE_ENTRA_ID_AUTHORITY || '',
            enabled: process.env.AZURE_ENTRA_ID_ENABLED === 'true'
        },
        speech: {
            key: process.env.AZURE_SPEECH_KEY || '',
            region: process.env.AZURE_SPEECH_REGION || 'eastus',
            language: process.env.AZURE_SPEECH_LANGUAGE || 'en-US',
            enabled: process.env.AZURE_SPEECH_ENABLED === 'true'
        },
        language: {
            key: process.env.AZURE_LANGUAGE_KEY || '',
            endpoint: process.env.AZURE_LANGUAGE_ENDPOINT || '',
            enabled: process.env.AZURE_LANGUAGE_ENABLED === 'true'
        },
        eventGrid: {
            endpoint: process.env.AZURE_EVENT_GRID_ENDPOINT || '',
            key: process.env.AZURE_EVENT_GRID_KEY || '',
            topicName: process.env.AZURE_EVENT_GRID_TOPIC_NAME || 'resqnet-events',
            enabled: process.env.AZURE_EVENT_GRID_ENABLED === 'true'
        },
        iot: {
            connectionString: process.env.AZURE_IOT_CONNECTION_STRING || '',
            enabled: process.env.AZURE_IOT_ENABLED === 'true',
            thresholds: {
                heartRateMin: parseInt(process.env.IOT_HEART_RATE_MIN || '40', 10),
                heartRateMax: parseInt(process.env.IOT_HEART_RATE_MAX || '150', 10),
                spO2Min: parseInt(process.env.IOT_SPO2_MIN || '90', 10),
                systolicMax: parseInt(process.env.IOT_SYSTOLIC_MAX || '180', 10),
                temperatureMax: parseFloat(process.env.IOT_TEMPERATURE_MAX || '39.5')
            }
        },
        fhir: {
            url: process.env.AZURE_FHIR_URL || '',
            tenantId: process.env.AZURE_FHIR_TENANT_ID || '',
            clientId: process.env.AZURE_FHIR_CLIENT_ID || '',
            clientSecret: process.env.AZURE_FHIR_CLIENT_SECRET || '',
            enabled: process.env.AZURE_FHIR_ENABLED === 'true'
        },
        maps: {
            subscriptionKey: process.env.AZURE_MAPS_SUBSCRIPTION_KEY || '',
            enabled: !!(process.env.AZURE_MAPS_SUBSCRIPTION_KEY)
        },
        communication: {
            connectionString: process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '',
            phoneNumber: process.env.AZURE_COMMUNICATION_PHONE_NUMBER || '',
            enabled: process.env.SMS_NOTIFICATIONS_ENABLED === 'true'
        },
        webPubSub: {
            connectionString: process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING || '',
            enabled: process.env.AZURE_WEB_PUBSUB_ENABLED === 'true'
        },
        applicationInsights: {
            connectionString: process.env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING || '',
            instrumentationKey: process.env.AZURE_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY || '',
            enabled: process.env.APPLICATION_INSIGHTS_ENABLED === 'true'
        }
    },

    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
    },

    socketIO: {
        enabled: process.env.SOCKET_IO_ENABLED !== 'false',
        cors: {
            origin: (process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
        },
        pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT || '60000', 10)
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        auth: {
            windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10),
            max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10)
        }
    },

    emergency: {
        defaultSearchRadiusKm: parseInt(process.env.DEFAULT_SEARCH_RADIUS_KM || '50', 10),
        maxAmbulanceCandidates: parseInt(process.env.MAX_AMBULANCE_CANDIDATES || '10', 10),
        maxHospitalCandidates: parseInt(process.env.MAX_HOSPITAL_CANDIDATES || '5', 10),
        autoEscalationTimeoutMinutes: parseInt(process.env.AUTO_ESCALATION_TIMEOUT_MINUTES || '5', 10),
        updateThrottleSeconds: parseInt(process.env.EMERGENCY_UPDATE_THROTTLE_SECONDS || '30', 10)
    },

    fallbacks: {
        aiTriageEnabled: process.env.AI_TRIAGE_FALLBACK_ENABLED !== 'false',
        mapsEnabled: process.env.MAPS_FALLBACK_ENABLED !== 'false'
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'simple'
    },

    development: {
        verboseErrors: process.env.VERBOSE_ERRORS === 'true',
        mockAzureServices: process.env.MOCK_AZURE_SERVICES === 'true',
        autoSeedDatabase: process.env.AUTO_SEED_DATABASE === 'true'
    }
};

export default config;
