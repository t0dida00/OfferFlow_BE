"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppJWT = exports.verifyIdToken = exports.exchangeCodeForTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const exchangeCodeForTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: env_1.env.GOOGLE_CLIENT_ID,
        client_secret: env_1.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env_1.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
    }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    return data;
});
exports.exchangeCodeForTokens = exchangeCodeForTokens;
const verifyIdToken = (idToken) => {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
    if (payload.aud !== env_1.env.GOOGLE_CLIENT_ID) {
        throw new Error("Invalid audience");
    }
    return payload; // email, sub, name, picture
};
exports.verifyIdToken = verifyIdToken;
const createAppJWT = (user) => {
    return jsonwebtoken_1.default.sign({ sub: user.sub, email: user.email }, env_1.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.createAppJWT = createAppJWT;
