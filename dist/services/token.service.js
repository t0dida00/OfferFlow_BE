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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleTokensForUser = exports.saveGoogleTokens = void 0;
// In-memory storage for tokens (Note: This will reset on server restart)
// In a production app, use a database (e.g., PostgreSQL, MongoDB, Redis)
const tokenStore = new Map();
const saveGoogleTokens = (userId, tokens) => __awaiter(void 0, void 0, void 0, function* () {
    tokenStore.set(userId, tokens);
    console.log(`Saved tokens for user ${userId}`);
});
exports.saveGoogleTokens = saveGoogleTokens;
const getGoogleTokensForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return tokenStore.get(userId);
});
exports.getGoogleTokensForUser = getGoogleTokensForUser;
