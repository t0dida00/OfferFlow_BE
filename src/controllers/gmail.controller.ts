import { Request, Response } from 'express';
import { fetchRecentEmails } from '../services/gmail.service';
import { getValidAccessToken } from '../services/token.service';
import { analyzeBulkEmails } from '../services/huggingFace.service';
import { Email } from '../models/email.model';
import { Application } from '../models/application.model';
import { User } from '../models/user.model';

export const getRecentEmails = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        // 👇 req.user comes from JWT middleware
        const userId = (req as any).user?.sub;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }


        // 🔐 Load Google tokens from backend storage (auto-refreshes if needed)
        const accessToken = await getValidAccessToken(userId);


        const emails = await fetchRecentEmails(accessToken, limit);
        res.json({
            success: true,
            data: emails
        });
    } catch (error: any) {
        console.error('Error in getRecentEmails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
};

export const emailAnalysis = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const userId = (req as any).user?.sub;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }


        const accessToken = await getValidAccessToken(userId);


        // 1. Fetch emails
        const emails = await fetchRecentEmails(accessToken, limit);

        const user = await User.findOne({ googleId: userId });
        const lastSyncedId = user?.lastSyncedEmailId;

        let emailsToAnalyze = emails;

        if (lastSyncedId) {
            const lastSyncedIndex = emails.findIndex(e => e?.id === lastSyncedId);
            if (lastSyncedIndex !== -1) {
                // If found, take all emails before this index (newer ones)
                emailsToAnalyze = emails.slice(0, lastSyncedIndex);
            }
            // If not found in current batch, we assume all match (or we'd need pagination, but treating as all new for now)
        }

        // Update last synced ID to the latest email (first in the list) AND update lastSyncTime
        const updateData: any = { lastSyncTime: new Date() };
        if (emails.length > 0 && emails[0]?.id) {
            updateData.lastSyncedEmailId = emails[0].id;
        }
        await User.findOneAndUpdate({ googleId: userId }, updateData);


        if (emailsToAnalyze.length === 0) {
            console.log("No new emails to analyze");
            return res.json({
                success: true,
                message: "No new emails to analyze",
                formatedEmailData: [],
                formatedApplicationData: []
            });
        }

        const formatedDataToAnalyze = emailsToAnalyze.map((email) => {
            return {
                id: email?.id,
                subject: email?.subject,
                content: email?.content
            }
        });

        // 2. Analyze emails
        const analyzedEmails = await analyzeBulkEmails(JSON.stringify(formatedDataToAnalyze));

        // res.json({
        //     success: true,
        //     count: analyzedEmails.length,
        //     data: analyzedEmails
        // });
        const formatedEmailData = analyzedEmails.map((email, index) => {
            return {
                id: email?.id,
                status: email?.status,
                subject: emails.find((e) => e?.id === email?.id)?.subject,
                snippet: emails.find((e) => e?.id === email?.id)?.snippet,
                date: emails.find((e) => e?.id === email?.id)?.date,
            }
        });
        const formatedApplicationData = analyzedEmails.map((application) => {
            return {
                id: application?.id,
                status: application?.status,
                company: application?.company,
                role: application?.role,
                location: application?.location,
                date: emails.find((e) => e?.id === application?.id)?.date,
            }
        });


        // Persist Emails
        await Promise.all(formatedEmailData.map((email) => {
            return Email.findOneAndUpdate(
                { emailId: email.id },
                { ...email, userId, emailId: email.id },
                { upsert: true, new: true }
            );
        }));

        // Persist Applications
        // We group by userId + company + role (case insensitive?)
        // For now, assuming exact match or we prefer normalized company name from AI
        await Promise.all(formatedApplicationData.map((app) => {
            return Application.findOneAndUpdate(
                {
                    userId,
                    company: app.company,
                    role: app.role
                },
                {
                    $addToSet: { emailIds: app.id },
                    $set: {
                        status: app.status,
                        location: app.location,
                        date: app.date
                    }
                },
                { upsert: true, new: true }
            );
        }));

        return res.json({
            success: true,
            formatedEmailData,
            formatedApplicationData
        });
    } catch (error: any) {
        console.error('Error in emailAnalysis:', error);
        res.status(500).json({ error: 'Failed to analyze emails' });
    }
};

export const getStoredEmails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const emails = await Email.find({ userId })
            .sort({ date: -1 })
            .limit(limit);

        res.json({ success: true, count: emails.length, data: emails });
    } catch (error) {
        console.error('Error fetching stored emails:', error);
        res.status(500).json({ error: 'Failed to fetch stored emails' });
    }
};

export const getStoredApplications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const applications = await Application.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(limit);

        res.json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        console.error('Error fetching stored applications:', error);
        res.status(500).json({ error: 'Failed to fetch stored applications' });
    }
};
