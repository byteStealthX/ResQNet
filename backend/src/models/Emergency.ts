import mongoose, { Schema, Document } from 'mongoose';

export enum EmergencyType {
    CARDIAC = 'cardiac',
    TRAUMA = 'trauma',
    RESPIRATORY = 'respiratory',
    STROKE = 'stroke',
    BURN = 'burn',
    POISONING = 'poisoning',
    ACCIDENT = 'accident',
    OTHER = 'other'
}

export enum EmergencySeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum EmergencyStatus {
    REPORTED = 'reported',
    TRIAGED = 'triaged',
    DISPATCHED = 'dispatched',
    EN_ROUTE = 'en_route',
    ON_SCENE = 'on_scene',
    TRANSPORTING = 'transporting',
    AT_HOSPITAL = 'at_hospital',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface IAITriageResult {
    severity: EmergencySeverity;
    confidence: number;
    reasoning: string;
    recommendedActions: string[];
    estimatedResponseTime: number;
}

export interface IEmergency extends Document {
    reporterId: mongoose.Types.ObjectId;
    type: EmergencyType;
    severity: EmergencySeverity;
    status: EmergencyStatus;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    address: string;
    patientInfo: {
        name: string;
        age: number;
        gender: string;
        phone: string;
        medicalHistory?: string[];
        allergies?: string[];
        currentMedications?: string[];
    };
    vitals?: {
        heartRate?: number;
        bloodPressure?: string;
        respiratoryRate?: number;
        temperature?: number;
        oxygenSaturation?: number;
    };
    aiTriage?: IAITriageResult;
    assignedAmbulanceId?: mongoose.Types.ObjectId;
    assignedHospitalId?: mongoose.Types.ObjectId;
    timeline: {
        reported: Date;
        triaged?: Date;
        dispatched?: Date;
        arrivedOnScene?: Date;
        departedToHospital?: Date;
        arrivedAtHospital?: Date;
        completed?: Date;
    };
    eta?: {
        ambulanceToScene: number;
        sceneToHospital: number;
    };
    notes: string[];
    requiredResources: string[];
    metadata: {
        source: string;
        reporterRelation?: string;
        numberOfCasualties?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const EmergencySchema = new Schema<IEmergency>(
    {
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: Object.values(EmergencyType),
            required: true
        },
        severity: {
            type: String,
            enum: Object.values(EmergencySeverity),
            required: true,
            default: EmergencySeverity.MEDIUM
        },
        status: {
            type: String,
            enum: Object.values(EmergencyStatus),
            required: true,
            default: EmergencyStatus.REPORTED
        },
        description: {
            type: String,
            required: true
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
            type: String,
            required: true
        },
        patientInfo: {
            name: { type: String, required: true },
            age: { type: Number, required: true },
            gender: { type: String, required: true },
            phone: { type: String, required: true },
            medicalHistory: [{ type: String }],
            allergies: [{ type: String }],
            currentMedications: [{ type: String }]
        },
        vitals: {
            heartRate: { type: Number },
            bloodPressure: { type: String },
            respiratoryRate: { type: Number },
            temperature: { type: Number },
            oxygenSaturation: { type: Number }
        },
        aiTriage: {
            severity: {
                type: String,
                enum: Object.values(EmergencySeverity)
            },
            confidence: { type: Number, min: 0, max: 1 },
            reasoning: { type: String },
            recommendedActions: [{ type: String }],
            estimatedResponseTime: { type: Number }
        },
        assignedAmbulanceId: {
            type: Schema.Types.ObjectId,
            ref: 'Ambulance',
            required: false
        },
        assignedHospitalId: {
            type: Schema.Types.ObjectId,
            ref: 'Hospital',
            required: false
        },
        timeline: {
            reported: { type: Date, required: true, default: Date.now },
            triaged: { type: Date },
            dispatched: { type: Date },
            arrivedOnScene: { type: Date },
            departedToHospital: { type: Date },
            arrivedAtHospital: { type: Date },
            completed: { type: Date }
        },
        eta: {
            ambulanceToScene: { type: Number },
            sceneToHospital: { type: Number }
        },
        notes: [{ type: String }],
        requiredResources: [{ type: String }],
        metadata: {
            source: { type: String, default: 'mobile_app' },
            reporterRelation: { type: String },
            numberOfCasualties: { type: Number, default: 1 }
        }
    },
    {
        timestamps: true
    }
);

// Create 2dsphere index for geospatial queries
EmergencySchema.index({ location: '2dsphere' });
EmergencySchema.index({ status: 1 });
EmergencySchema.index({ severity: 1 });
EmergencySchema.index({ type: 1 });
EmergencySchema.index({ reporterId: 1 });
EmergencySchema.index({ assignedAmbulanceId: 1 });
EmergencySchema.index({ assignedHospitalId: 1 });

export default mongoose.model<IEmergency>('Emergency', EmergencySchema);
