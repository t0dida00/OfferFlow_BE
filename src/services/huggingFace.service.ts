import { HfInference } from "@huggingface/inference";
import { env } from "../config/env";

/* ========================= CONFIG ========================= */

const HF_TOKEN = env.HUGGINGFACE_API_TOKEN;
const MODEL = env.HUGGINGFACE_MODEL; // openai/gpt-oss-120b

if (!HF_TOKEN) {
    throw new Error("HUGGINGFACE_API_TOKEN not configured");
}

if (!MODEL) {
    throw new Error("HUGGINGFACE_MODEL not configured");
}

const hf = new HfInference(HF_TOKEN);

/* ========================= ANALYZER ========================= */

type JobResult =
    | { break: true }
    | {
        company: string;
        role: string;
        location: string;
        status: "pending" | "interview" | "rejected" | "offer";
    };

export async function analyzeText(text: string): Promise<JobResult> {
    const prompt = `
Extract job data as JSON only. If none return {"break":true}. Else return {"company":string|null,"role":string|null,"location":"N/A"|string,"status":"offer"|"pending"|"rejected"|"interview"}. No explanation. Minimum reasoning. Text:${text}

`;

    try {
        const result = await hf.chatCompletion({
            model: MODEL,
            messages: [
                {
                    role: "user",
                    content: prompt.trim(),
                },
            ],
            temperature: 0,
        });

        const content = result.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Empty response from model");
        }

        const parsed = JSON.parse(content);

        if (
            parsed.break === true ||
            (parsed.company &&
                parsed.role &&
                parsed.location &&
                ["pending", "interview", "rejected", "offer"].includes(parsed.status))
        ) {
            return parsed;
        }

        throw new Error("Invalid JSON shape returned");

    } catch (error: any) {
        console.error(
            "HuggingFace Service Error:",
            error?.response?.status,
            error?.response?.data || error.message
        );
        throw new Error("Failed to analyze text with HuggingFace");
    }
}
