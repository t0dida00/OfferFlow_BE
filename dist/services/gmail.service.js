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
exports.fetchRecentEmails = void 0;
const googleapis_1 = require("googleapis");
const fetchRecentEmails = (accessToken_1, ...args_1) => __awaiter(void 0, [accessToken_1, ...args_1], void 0, function* (accessToken, limit = 10) {
    try {
        console.log('Fetching recent emails...');
        const auth = new googleapis_1.google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth });
        // List messages
        const response = yield gmail.users.messages.list({
            userId: 'me',
            maxResults: limit,
        });
        const messages = response.data.messages || [];
        if (messages.length === 0) {
            return [];
        }
        // Fetch details for each message
        const emailPromises = messages.map((msg) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!msg.id)
                return null;
            const detail = yield gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full',
            });
            const payload = detail.data.payload;
            const headers = (payload === null || payload === void 0 ? void 0 : payload.headers) || [];
            const subject = ((_a = headers.find((h) => h.name === 'Subject')) === null || _a === void 0 ? void 0 : _a.value) || 'No Subject';
            const from = ((_b = headers.find((h) => h.name === 'From')) === null || _b === void 0 ? void 0 : _b.value) || 'Unknown Sender';
            const date = ((_c = headers.find((h) => h.name === 'Date')) === null || _c === void 0 ? void 0 : _c.value) || '';
            return {
                id: msg.id,
                snippet: detail.data.snippet,
                subject,
                from,
                date,
            };
        }));
        const emails = yield Promise.all(emailPromises);
        return emails.filter((email) => email !== null);
    }
    catch (error) {
        console.error('Error fetching Gmail emails:', error);
        throw new Error('Failed to fetch emails from Gmail');
    }
});
exports.fetchRecentEmails = fetchRecentEmails;
