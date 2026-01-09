import { Request, Response } from 'express';
import { fetchRecentEmails } from '../services/gmail.service';
import { getGoogleTokensForUser } from '../services/token.service';

export const getRecentEmails = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        // 👇 req.user comes from JWT middleware
        const userId = (req as any).user?.sub;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 🔐 Load Google tokens from backend storage
        const tokens = await getGoogleTokensForUser(userId);

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
