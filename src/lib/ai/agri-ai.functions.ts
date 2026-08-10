import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
});

const SYSTEM_PROMPT = `You are AgriShield AI, an agricultural risk-intelligence assistant for smallholder farmers.
You advise on crop risk, weather exposure, irrigation, pest pressure, market price trends and community risk-pool savings.
Be concise and practical: short paragraphs or tight bullet lists, concrete numbers when useful, and always note when something is an estimate.
Never give financial or insurance guarantees. If asked about payouts, explain that AgriShield pool payouts are simulated in this prototype.`;

export const askAgriShieldAI = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
      throw new Error(`AI request failed (${res.status})`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    return { content: content || "I couldn't generate a response. Please try rephrasing." };
  });
