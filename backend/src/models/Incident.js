const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Incident = sequelize.define('Incident', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    reporterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('MEDICAL', 'FIRE', 'POLICE', 'ACCIDENT', 'NATURAL_DISASTER', 'OTHER'),
        allowNull: false
    },
    severity: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        defaultValue: 'MEDIUM',
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('REPORTED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'RESOLVED', 'CANCELLED'),
        defaultValue: 'REPORTED',
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    location: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
            hasRequiredFields(value) {
                if (!value.latitude || !value.longitude) {
                    throw new Error('Location must include latitude and longitude');
                }
            }
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignedResponderId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    dispatchedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    arrivedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['type']
        },
        {
            fields: ['severity']
        },
        {
            fields: ['reporterId']
        },
        {
            fields: ['assignedResponderId']
        }
    ]
});

module.exports = Incident;
