import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
    PATIENT = 'patient',
    PARAMEDIC = 'paramedic',
    HOSPITAL_ADMIN = 'hospital_admin',
    ADMIN = 'admin'
}

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    hospitalId?: mongoose.Types.ObjectId;
    ambulanceId?: mongoose.Types.ObjectId;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
            default: UserRole.PATIENT
        },
        isActive: {
            type: Boolean,
            default: true
        },
        hospitalId: {
            type: Schema.Types.ObjectId,
            ref: 'Hospital',
            required: false
        },
        ambulanceId: {
            type: Schema.Types.ObjectId,
            ref: 'Ambulance',
            required: false
        },
        lastLogin: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.model<IUser>('User', UserSchema);
