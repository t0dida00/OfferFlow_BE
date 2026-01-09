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
exports.analyzeText = analyzeText;
const inference_1 = require("@huggingface/inference");
const env_1 = require("../config/env");
/* ========================= CONFIG ========================= */
const HF_TOKEN = env_1.env.HUGGINGFACE_API_TOKEN;
const MODEL = env_1.env.HUGGINGFACE_MODEL; // openai/gpt-oss-120b
if (!HF_TOKEN) {
    throw new Error("HUGGINGFACE_API_TOKEN not configured");
}
if (!MODEL) {
    throw new Error("HUGGINGFACE_MODEL not configured");
}
const hf = new inference_1.HfInference(HF_TOKEN);
function analyzeText(text) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const prompt = `
Extract job data as JSON only. If none return {"break":true}. Else return {"company":string|null,"role":string|null,"location":"N/A"|string,"status":"offer"|"pending"|"rejected"|"interview"}. No explanation. Minimum reasoning. Text:${text}

`;
        try {
            const result = yield hf.chatCompletion({
                model: MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt.trim(),
                    },
                ],
                temperature: 0,
            });
            const content = (_c = (_b = (_a = result.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
            if (!content) {
                throw new Error("Empty response from model");
            }
            const parsed = JSON.parse(content);
            if (parsed.break === true ||
                (parsed.company &&
                    parsed.role &&
                    parsed.location &&
                    ["pending", "interview", "rejected", "offer"].includes(parsed.status))) {
                return parsed;
            }
            throw new Error("Invalid JSON shape returned");
        }
        catch (error) {
            console.error("HuggingFace Service Error:", (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.status, ((_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
            throw new Error("Failed to analyze text with HuggingFace");
        }
    });
}
