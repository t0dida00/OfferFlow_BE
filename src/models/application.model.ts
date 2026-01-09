import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    userId: string;
    emailId: string; // Link to the source email
    company: string;
    role: string;
    location: string;
    status: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    userId: { type: String, required: true, ref: 'User' },
    emailId: { type: String, required: true, unique: true },
    company: { type: String },
    role: { type: String },
    location: { type: String },
    status: { type: String },
    date: { type: Date },
}, {
    timestamps: true
});

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
