import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('8080'),
    HUGGINGFACE_API_TOKEN: z.string().min(1, "HUGGINGFACE_API_TOKEN is required in .env"),
    HUGGINGFACE_MODEL: z.string().default('gpt2'), // or any other default model
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    GOOGLE_REDIRECT_URI: z.string().default("http://localhost:8080/api/v1/auth/google"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required")
});

const envServer = envSchema.safeParse(process.env);

if (!envServer.success) {
    console.error("❌ Invalid environment variables:", envServer.error.format());
    process.exit(1);
}

export const env = envServer.data;
