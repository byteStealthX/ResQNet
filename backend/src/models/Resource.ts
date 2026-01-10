import mongoose, { Schema, Document } from 'mongoose';

export enum ResourceType {
    EQUIPMENT = 'equipment',
    MEDICATION = 'medication',
    SUPPLY = 'supply',
    SPECIALIZED = 'specialized'
}

export enum ResourceCategory {
    CARDIAC = 'cardiac',
    TRAUMA = 'trauma',
    RESPIRATORY = 'respiratory',
    DIAGNOSTIC = 'diagnostic',
    SURGICAL = 'surgical',
    GENERAL = 'general'
}

export interface IResource extends Document {
    name: string;
    type: ResourceType;
    category: ResourceCategory;
    description: string;
    quantity: number;
    unit: string;
    isAvailable: boolean;
    criticalLevel: number;
    metadata: {
        manufacturer?: string;
        expiryDate?: Date;
        lastChecked?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: Object.values(ResourceType),
            required: true
        },
        category: {
            type: String,
            enum: Object.values(ResourceCategory),
            required: true
        },
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        criticalLevel: {
            type: Number,
            required: true,
            min: 0
        },
        metadata: {
            manufacturer: { type: String },
            expiryDate: { type: Date },
            lastChecked: { type: Date }
        }
    },
    {
        timestamps: true
    }
);

ResourceSchema.index({ type: 1 });
ResourceSchema.index({ category: 1 });
ResourceSchema.index({ isAvailable: 1 });

export default mongoose.model<IResource>('Resource', ResourceSchema);
