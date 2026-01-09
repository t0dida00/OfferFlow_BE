import { env } from '../config/env';

interface GoogleTokens {
    access_token: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    id_token?: string;
    expiry_date?: number;
}

// In-memory storage for tokens (Note: This will reset on server restart)
// In a production app, use a database (e.g., PostgreSQL, MongoDB, Redis)
const tokenStore = new Map<string, GoogleTokens>();

export const saveGoogleTokens = async (userId: string, tokens: any) => {
    tokenStore.set(userId, tokens);
    console.log(`Saved tokens for user ${userId}`);
};

export const getGoogleTokensForUser = async (userId: string) => {
    return tokenStore.get(userId);
};
