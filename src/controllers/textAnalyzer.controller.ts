import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analyzeText } from '../services/huggingFace.service';

const analyzeRequestSchema = z.object({
    text: z.string().min(1, 'Text is required'),
});

export const analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { text } = analyzeRequestSchema.parse(req.body);

        const result = await analyzeText(text);

        let parsedResult = result;

        // Try to parse JSON from the response if possible
        try {
            // Handle array response from HF (e.g. [{ generated_text: "..." }])
            const textContent = Array.isArray(result) && result[0]?.generated_text
                ? result[0].generated_text
                : (typeof result === 'string' ? result : JSON.stringify(result));

            // Attempt to find and parse JSON object in the text
            const firstBrace = textContent.indexOf('{');
            const lastBrace = textContent.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = textContent.substring(firstBrace, lastBrace + 1);
                parsedResult = JSON.parse(jsonString);
            }
        } catch (error) {
            console.warn('Failed to parse JSON from model output, returning raw result');
        }

        res.status(200).json({
            success: true,
            data: parsedResult,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: (error as z.ZodError).issues });
        } else {
            next(error);
        }
    }
};
