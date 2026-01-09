import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    userId: string;
    emailIds: string[]; // Link to source emails
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
    emailIds: [{ type: String }],
    company: { type: String },
    role: { type: String },
    location: { type: String },
    status: { type: String },
    date: { type: Date },
}, {
    timestamps: true
});

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
