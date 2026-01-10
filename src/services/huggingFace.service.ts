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

export async function analyzeBulkEmails(emails: string): Promise<any[]> {
    const prompt = `
You will receive an array of email objects. Return VALID JSON ONLY as an array. From the input, KEEP ONLY emails that are real job application emails I personally applied to or direct follow-ups of those applications. DROP everything else (which are not related to the job application) completely. For each kept email, analyze and return {id, status, company, role, location}. Status must be one of: Applied, Interview, Offer, Rejected.
EXAMPLE OUTPUT:
[{
    "id": string,
    "status": "Applied" | "Interview" | "Offer" | "Rejected",
    "company": string | null,
    "role": string |null,
    "location": string | null
}]
INPUT:${emails}

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
        console.log("Calling Bulk of Email Analysis")
        const content = result.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from model");
        }

        const parsed = JSON.parse(content);
        return parsed
        // if (
        //     parsed.break === true ||
        //     (parsed.company &&
        //         parsed.role &&
        //         parsed.location &&
        //         ["pending", "interview", "rejected", "offer"].includes(parsed.status))
        // ) {
        //     return parsed;
        // }

        // throw new Error("Invalid JSON shape returned");

    } catch (error: any) {
        console.error(
            "HuggingFace Service Error:",
            error?.response?.status,
            error?.response?.data || error.message
        );
        throw new Error("Failed to analyze text with HuggingFace");
    }
}
