import mongoose, { Schema, Document } from 'mongoose';

export enum AmbulanceStatus {
    AVAILABLE = 'available',
    EN_ROUTE = 'en_route',
    ON_SCENE = 'on_scene',
    TRANSPORTING = 'transporting',
    AT_HOSPITAL = 'at_hospital',
    OFFLINE = 'offline'
}

export enum AmbulanceType {
    BLS = 'BLS', // Basic Life Support
    ALS = 'ALS', // Advanced Life Support
    CCT = 'CCT', // Critical Care Transport
    AIR = 'AIR'  // Air Ambulance
}

export interface IAmbulance extends Document {
    number: string;
    type: AmbulanceType;
    status: AmbulanceStatus;
    currentLocation: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    baseLocation: {
        type: 'Point';
        coordinates: [number, number];
    };
    crew: {
        driver: string;
        paramedic: string;
        assistant?: string;
    };
    equipment: mongoose.Types.ObjectId[];
    currentEmergencyId?: mongoose.Types.ObjectId;
    assignedHospitalId?: mongoose.Types.ObjectId;
    lastMaintenanceDate: Date;
    isOperational: boolean;
    metadata: {
        vehicleRegistration: string;
        model: string;
        year: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AmbulanceSchema = new Schema<IAmbulance>(
    {
        number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        type: {
            type: String,
            enum: Object.values(AmbulanceType),
            required: true
        },
        status: {
            type: String,
            enum: Object.values(AmbulanceStatus),
            default: AmbulanceStatus.AVAILABLE,
            required: true
        },
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        baseLocation: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        crew: {
            driver: { type: String, required: true },
            paramedic: { type: String, required: true },
            assistant: { type: String, required: false }
        },
        equipment: [{
            type: Schema.Types.ObjectId,
            ref: 'Resource'
        }],
        currentEmergencyId: {
            type: Schema.Types.ObjectId,
            ref: 'Emergency',
            required: false
        },
        assignedHospitalId: {
            type: Schema.Types.ObjectId,
            ref: 'Hospital',
            required: false
        },
        lastMaintenanceDate: {
            type: Date,
            required: true
        },
        isOperational: {
            type: Boolean,
            default: true
        },
        metadata: {
            vehicleRegistration: { type: String, required: true },
            model: { type: String, required: true },
            year: { type: Number, required: true }
        }
    },
    {
        timestamps: true
    }
);

// Create 2dsphere index for geospatial queries
AmbulanceSchema.index({ currentLocation: '2dsphere' });
AmbulanceSchema.index({ baseLocation: '2dsphere' });
AmbulanceSchema.index({ status: 1 });
AmbulanceSchema.index({ type: 1 });

export default mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);
