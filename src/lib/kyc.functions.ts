import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
    const request = getRequest();
    const token = request?.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return { ok: false, error: "Unauthorized: No token" };

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { ok: false, error: "Unauthorized: Invalid user" };
    const userId = user.id;
    // We cannot use requireSupabaseAuth in a way that risks client bundling.
    // We will verify the user manually inside the handler using the incoming auth context if possible,
    // or we verify the session.
    
    // For TanStack Start with Supabase, middleware can sometimes cause these issues.
    // Let's use dynamic imports for everything server-side.
    // const { supabase } = context as any; // Removed to avoid duplication
    
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI service unavailable" };
    }

    // Load the doc with user context to respect RLS
    const { data: doc, error: docErr } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("id", data.documentId)
      .single();
    if (docErr || !doc) return { ok: false, error: "Document not found" };
    
    // Download from private bucket with user context
    const { data: file, error: dlErr } = await supabase.storage
      .from("kyc-documents")
      .download(doc.storage_path);
    if (dlErr || !file) return { ok: false, error: "Could not read document" };

    const buf = Buffer.from(await file.arrayBuffer());
    const base64 = buf.toString("base64");
    const mime = file.type || "image/jpeg";

    // Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: "You extract information from Indian government ID cards. Return strict JSON only with keys: name (string|null), id_number (string|null, digits only). No commentary.",
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
      return { ok: false, error: `AI error ${aiRes.status}` };
    }

    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) try { parsed = JSON.parse(m[0]); } catch {}
    }

    const name = (parsed.name ?? "").toString().trim().slice(0, 120) || null;
    const digits = (parsed.id_number ?? "").toString().replace(/\D/g, "");
    const masked = digits.length >= 4 ? "X".repeat(Math.max(0, digits.length - 4)) + digits.slice(-4) : null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: updErr } = await supabaseAdmin
      .from("kyc_documents")
      .update({
        extracted_name: name,
        masked_id_number: masked,
        status: "pending",
      })
      .eq("id", doc.id);
      
    if (updErr) return { ok: false, error: updErr.message };

    return { ok: true, extracted_name: name, masked_id_number: masked };
  });
