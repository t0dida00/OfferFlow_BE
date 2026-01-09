"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('8080'),
    HUGGINGFACE_API_TOKEN: zod_1.z.string().min(1, "HUGGINGFACE_API_TOKEN is required in .env"),
    HUGGINGFACE_MODEL: zod_1.z.string().default('gpt2'), // or any other default model
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    GOOGLE_REDIRECT_URI: zod_1.z.string().default("http://localhost:8080/api/v1/auth/google"),
    JWT_SECRET: zod_1.z.string().min(1, "JWT_SECRET is required")
});
const envServer = envSchema.safeParse(process.env);
if (!envServer.success) {
    console.error("❌ Invalid environment variables:", envServer.error.format());
    process.exit(1);
}
exports.env = envServer.data;
