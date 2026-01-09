import { Request, Response } from "express";
import {
    exchangeCodeForTokens,
    verifyIdToken,
    createAppJWT
} from "../services/auth.service";
import { saveUserWithTokens } from "../services/token.service";

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
            `http://localhost:3000/login-success?token=${appToken}`
        );
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};
