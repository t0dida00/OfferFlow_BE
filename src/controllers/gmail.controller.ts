import { Request, Response } from 'express';
import { fetchRecentEmails } from '../services/gmail.service';
import { getUserTokens } from '../services/token.service';
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

        // 🔐 Load Google tokens from backend storage
        const tokens = await getUserTokens(userId);

        if (!tokens?.access_token) {
            return res.status(401).json({ error: "Google account not linked or tokens expired" });
        }

        const emails = await fetchRecentEmails(tokens.access_token, limit);
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

        const tokens = await getUserTokens(userId);

        if (!tokens?.access_token) {
            return res.status(401).json({ error: "Google account not linked or tokens expired" });
        }

        // 1. Fetch emails
        const emails = await fetchRecentEmails(tokens.access_token, limit);

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

        // Update last synced ID to the latest email (first in the list)
        if (emails.length > 0 && emails[0]?.id) {
            await User.findOneAndUpdate({ googleId: userId }, { lastSyncedEmailId: emails[0].id });
        }

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
        await Promise.all(formatedApplicationData.map((app) => {
            return Application.findOneAndUpdate(
                { emailId: app.id },
                { ...app, userId, emailId: app.id },
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
