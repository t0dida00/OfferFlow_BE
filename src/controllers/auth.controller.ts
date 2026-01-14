import { Request, Response } from "express";
import { env } from "../config/env";
import {
    exchangeCodeForTokens,
    verifyIdToken,
    createAppJWT,
    getGoogleAuthURL
} from "../services/auth.service";
import { saveUserWithTokens } from "../services/token.service";

export const redirectToGoogle = (req: Request, res: Response) => {
    res.redirect(getGoogleAuthURL());
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;
        if (!code) throw new Error("Missing code");

        const tokens = await exchangeCodeForTokens(code);
        const userInfo = verifyIdToken(tokens.id_token);

        // Save/Update user and tokens in MongoDB
        const user = await saveUserWithTokens(
            userInfo.sub,
            userInfo.email,
            userInfo.name,
            userInfo.picture,
            tokens
        );

        const appToken = createAppJWT({
            sub: user.googleId,
            email: user.email,
            name: user.name,
            picture: user.picture
        });

        res.redirect(
            `${env.FRONTEND_URI}/login-success?token=${appToken}`
        );
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

import { User } from "../models/user.model";

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findOne({ googleId: userId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const formatedData = {
            id: user.googleId,
            email: user.email,
            name: user.name,
            lastSyncedEmailId: user.lastSyncedEmailId,
            lastSyncTime: user.lastSyncTime
        }
        res.json({
            success: true,
            data: formatedData
        });
    } catch (error: any) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
