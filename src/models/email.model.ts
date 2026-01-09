import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
    userId: string;
    emailId: string; // Gmail Message ID
    subject: string;
    snippet: string;
    status: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EmailSchema: Schema = new Schema({
    userId: { type: String, required: true, ref: 'User' },
    emailId: { type: String, required: true, unique: true },
    subject: { type: String },
    snippet: { type: String },
    status: { type: String },
    date: { type: Date },
}, {
    timestamps: true
});

export const Email = mongoose.model<IEmail>('Email', EmailSchema);
