import { config } from './environment';

export const azureConfig = {
    openai: {
        endpoint: config.azure.openai.endpoint,
        apiKey: config.azure.openai.apiKey,
        deploymentName: config.azure.openai.deploymentName,
        enabled: Boolean(config.azure.openai.endpoint && config.azure.openai.apiKey)
    },

    maps: {
        subscriptionKey: config.azure.maps.subscriptionKey,
        enabled: Boolean(config.azure.maps.subscriptionKey)
    },

    communication: {
        connectionString: config.azure.communication.connectionString,
        phoneNumber: config.azure.communication.phoneNumber,
        enabled: Boolean(config.azure.communication.connectionString)
    },

    webPubSub: {
        connectionString: config.azure.webPubSub.connectionString,
        enabled: Boolean(config.azure.webPubSub.connectionString)
    }
};

export default azureConfig;
