import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Reads a KYC image from storage, sends to Lovable AI Gateway (Gemini) for OCR,
 * extracts name + ID number, masks the ID number, then updates the kyc_documents row.
 */
export const processKycDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { documentId: string }) => {
    if (!input?.documentId || typeof input.documentId !== "string") {
      throw new Error("documentId required");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI service unavailable" };
    }

    // Load the doc and verify ownership
    const { data: doc, error: docErr } = await supabaseAdmin
      .from("kyc_documents")
      .select("*")
      .eq("id", data.documentId)
      .single();
    if (docErr || !doc) return { ok: false, error: "Document not found" };
    if (doc.user_id !== userId) return { ok: false, error: "Forbidden" };

    // Download from private bucket
    const { data: file, error: dlErr } = await supabaseAdmin.storage
      .from("kyc-documents")
      .download(doc.storage_path);
    if (dlErr || !file) return { ok: false, error: "Could not read document" };

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");
    const mime = file.type || "image/jpeg";

    // Call Lovable AI Gateway with vision
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You extract information from Indian government ID cards. Return strict JSON only with keys: name (string|null), id_number (string|null, digits only). No commentary.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the holder name and ID number from this document." },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text().catch(() => "");
      console.error("AI gateway error", aiRes.status, text);
      return { ok: false, error: `AI error ${aiRes.status}` };
    }

    const aiJson = (await aiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: { name?: string | null; id_number?: string | null } = {};
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // try to extract JSON substring
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          /* ignore */
        }
      }
    }

    const name = (parsed.name ?? "").toString().trim().slice(0, 120) || null;
    const digits = (parsed.id_number ?? "").toString().replace(/\D/g, "");
    const masked =
      digits.length >= 4 ? "X".repeat(Math.max(0, digits.length - 4)) + digits.slice(-4) : null;

    const { error: updErr } = await supabaseAdmin
      .from("kyc_documents")
      .update({
        extracted_name: name,
        masked_id_number: masked,
        status: "pending", // still pending official review
      })
      .eq("id", doc.id);
    if (updErr) return { ok: false, error: updErr.message };

    return { ok: true, extracted_name: name, masked_id_number: masked };
  });
