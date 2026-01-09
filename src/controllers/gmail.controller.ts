import { Request, Response } from 'express';
import { fetchRecentEmails } from '../services/gmail.service';
import { getUserTokens } from '../services/token.service';
import { analyzeBulkEmails } from '../services/huggingFace.service';

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
        const formatedDataToAnalyze = emails.map((email) => {
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
