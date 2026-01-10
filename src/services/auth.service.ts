import jwt from "jsonwebtoken";
import axios from "axios";
import { env } from "../config/env";

export const exchangeCodeForTokens = async (code: string) => {
    const { data } = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code"
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return data;
};

export const verifyIdToken = (idToken: string) => {
    const payload = JSON.parse(
        Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    if (payload.aud !== env.GOOGLE_CLIENT_ID) {
        throw new Error("Invalid audience");
    }

    return payload; // email, sub, name, picture
};


export const createAppJWT = (user: any) => {
    return jwt.sign(
        { sub: user.sub, email: user.email },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const refreshGoogleToken = async (refreshToken: string) => {
    const { data } = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }
    );

    return data; // contains access_token, expires_in, scope, token_type
};
