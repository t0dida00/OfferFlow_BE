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
exports.getRecentEmails = void 0;
const gmail_service_1 = require("../services/gmail.service");
const token_service_1 = require("../services/token.service");
const getRecentEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        // 👇 req.user comes from JWT middleware
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // 🔐 Load Google tokens from backend storage
        const tokens = yield (0, token_service_1.getGoogleTokensForUser)(userId);
        if (!(tokens === null || tokens === void 0 ? void 0 : tokens.access_token)) {
            return res.status(401).json({ error: "Google account not linked or tokens expired" });
        }
        const emails = yield (0, gmail_service_1.fetchRecentEmails)(tokens.access_token, limit);
        res.json({
            success: true,
            data: emails
        });
    }
    catch (error) {
        console.error('Error in getRecentEmails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});
exports.getRecentEmails = getRecentEmails;
