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

export const getUserTokens = async (userId: string) => {
    const user = await User.findOne({ googleId: userId });
    if (!user) return null;
    return {
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.tokenExpiry ? user.tokenExpiry.getTime() : undefined,
    };
};
