import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const searchUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        // Allow-list safe characters only; PostgREST filter metacharacters
        // (, . ( ) % * : " \) are rejected outright rather than escaped.
        query: z
          .string()
          .min(2)
          .max(50)
          .regex(/^[\p{L}\p{N} _-]+$/u, "Invalid search characters"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context as any;
    if (!userId) throw new Error("Unauthorized: User session required");

    // Extra security verification: verify token identity matches context userId
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user || user.id !== userId) {
      throw new Error("Unauthorized: Invalid user identity");
    }

    const term = data.query.trim();

    // Parameterized per-column filters — no raw filter-string interpolation.
    const [byUsername, byName] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url")
        .ilike("username", `%${term}%`)
        .limit(10),
      supabase
        .from("profiles")
        .select("user_id, full_name, username, avatar_url")
        .ilike("full_name", `%${term}%`)
        .limit(10),
    ]);

    if (byUsername.error) throw byUsername.error;
    if (byName.error) throw byName.error;

    const merged = new Map<string, any>();
    for (const row of [...(byUsername.data ?? []), ...(byName.data ?? [])]) {
      merged.set(row.user_id, row);
    }
    return Array.from(merged.values()).slice(0, 10);
  });

