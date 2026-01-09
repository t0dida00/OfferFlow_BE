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
exports.analyze = void 0;
const zod_1 = require("zod");
const huggingFace_service_1 = require("../services/huggingFace.service");
const analyzeRequestSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, 'Text is required'),
});
const analyze = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { text } = analyzeRequestSchema.parse(req.body);
        const result = yield (0, huggingFace_service_1.analyzeText)(text);
        let parsedResult = result;
        // Try to parse JSON from the response if possible
        try {
            // Handle array response from HF (e.g. [{ generated_text: "..." }])
            const textContent = Array.isArray(result) && ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.generated_text)
                ? result[0].generated_text
                : (typeof result === 'string' ? result : JSON.stringify(result));
            // Attempt to find and parse JSON object in the text
            const firstBrace = textContent.indexOf('{');
            const lastBrace = textContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = textContent.substring(firstBrace, lastBrace + 1);
                parsedResult = JSON.parse(jsonString);
            }
        }
        catch (error) {
            console.warn('Failed to parse JSON from model output, returning raw result');
        }
        res.status(200).json({
            success: true,
            data: parsedResult,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ success: false, error: error.issues });
        }
        else {
            next(error);
        }
    }
});
exports.analyze = analyze;
