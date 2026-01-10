import { User } from '../models/user.model';

interface GoogleTokens {
    access_token: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    id_token?: string;
    expiry_date?: number;
}

export const saveUserWithTokens = async (
    googleId: string,
    email: string,
    name: string,
    picture: string,
    tokens: GoogleTokens
) => {
    const updateData: any = {
        email,
        name,
        picture,
        accessToken: tokens.access_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };

    if (tokens.refresh_token) {
        updateData.refreshToken = tokens.refresh_token;
    }

    const user = await User.findOneAndUpdate(
        { googleId },
        updateData,
        { upsert: true, new: true }
    );

    return user;
};


export const updateAccessToken = async (userId: string, tokens: any) => {
    const updateData: any = {
        accessToken: tokens.access_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
    };

    await User.findOneAndUpdate(
        { googleId: userId },
        updateData,
        { new: true }
    );
};

import { refreshGoogleToken } from './auth.service';

export const getValidAccessToken = async (userId: string) => {
    const user = await User.findOne({ googleId: userId });
    if (!user) {
        throw new Error('User not found');
    }

    if (!user.accessToken || !user.refreshToken) {
        throw new Error('User tokens missing');
    }

    // Check if token is expired or about to expire (e.g., within 5 minutes)
    const now = new Date();
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes
    const isExpired = !user.tokenExpiry || (user.tokenExpiry.getTime() - expiryBuffer < now.getTime());

    if (isExpired) {
        console.log('Access token expired, refreshing...');
        try {
            const newTokens = await refreshGoogleToken(user.refreshToken);
            await updateAccessToken(userId, newTokens);
            return newTokens.access_token;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            throw new Error('Failed to refresh access token');
        }
    }

    return user.accessToken;
};
