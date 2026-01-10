import { Request, Response } from 'express';
import { Application } from '../models/application.model';

export const updateApplication = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;
        const { id } = req.params;
        const updates = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Prevent updating sensitive fields if any (e.g. userId, emailIds?)
        // For now, allow updating status, company, role, location, date, AND emailIds
        const allowedUpdates = ['status', 'company', 'role', 'location', 'date', 'emailIds'];
        const actualUpdates: any = {};

        Object.keys(updates).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                actualUpdates[key] = updates[key];
            }
        });

        const application = await Application.findOneAndUpdate(
            { _id: id, userId }, // Ensure the application belongs to the user
            { $set: actualUpdates },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error: any) {
        console.error('Error updates application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
};
