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
exports.googleCallback = void 0;
const auth_service_1 = require("../services/auth.service");
const token_service_1 = require("../services/token.service");
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = req.query.code;
        if (!code)
            throw new Error("Missing code");
        const tokens = yield (0, auth_service_1.exchangeCodeForTokens)(code);
        const user = (0, auth_service_1.verifyIdToken)(tokens.id_token);
        // Save tokens securely (in memory for now)
        yield (0, token_service_1.saveGoogleTokens)(user.sub, tokens);
        const appToken = (0, auth_service_1.createAppJWT)(user);
        res.redirect(`http://localhost:3000/login-success?token=${appToken}`);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
exports.googleCallback = googleCallback;
