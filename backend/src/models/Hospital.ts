import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    contact: {
        phone: string;
        emergencyLine: string;
        email: string;
    };
    capacity: {
        totalBeds: number;
        availableBeds: number;
        icuBeds: number;
        availableICUBeds: number;
        emergencyBeds: number;
        availableEmergencyBeds: number;
    };
    departments: string[];
    specializations: string[];
    resources: mongoose.Types.ObjectId[];
    traumaLevel?: number; // 1-5 (1 being highest)
    ratings: {
        overall: number;
        emergencyCare: number;
    };
    isOperational: boolean;
    acceptingEmergencies: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        location: {
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
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true, default: 'India' }
        },
        contact: {
            phone: { type: String, required: true },
            emergencyLine: { type: String, required: true },
            email: { type: String, required: true }
        },
        capacity: {
            totalBeds: { type: Number, required: true },
            availableBeds: { type: Number, required: true },
            icuBeds: { type: Number, required: true },
            availableICUBeds: { type: Number, required: true },
            emergencyBeds: { type: Number, required: true },
            availableEmergencyBeds: { type: Number, required: true }
        },
        departments: [{ type: String }],
        specializations: [{ type: String }],
        resources: [{
            type: Schema.Types.ObjectId,
            ref: 'Resource'
        }],
        traumaLevel: {
            type: Number,
            min: 1,
            max: 5,
            required: false
        },
        ratings: {
            overall: { type: Number, min: 0, max: 5, default: 4.0 },
            emergencyCare: { type: Number, min: 0, max: 5, default: 4.0 }
        },
        isOperational: {
            type: Boolean,
            default: true
        },
        acceptingEmergencies: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Create 2dsphere index for geospatial queries
HospitalSchema.index({ location: '2dsphere' });
HospitalSchema.index({ acceptingEmergencies: 1 });
HospitalSchema.index({ 'capacity.availableICUBeds': 1 });

export default mongoose.model<IHospital>('Hospital', HospitalSchema);
