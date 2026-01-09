import { Request, Response } from "express";
import {
    exchangeCodeForTokens,
    verifyIdToken,
    createAppJWT
} from "../services/auth.service";
import { saveGoogleTokens } from "../services/token.service";

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;
        if (!code) throw new Error("Missing code");

        const tokens = await exchangeCodeForTokens(code);
        const user = verifyIdToken(tokens.id_token);

        // Save tokens securely (in memory for now)
        await saveGoogleTokens(user.sub, tokens);

        const appToken = createAppJWT(user);

        res.redirect(
            `http://localhost:3000/login-success?token=${appToken}`
        );
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};
