import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const searchUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ query: z.string().min(2) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, username, avatar_url")
      .or(`username.ilike.%${data.query}%,full_name.ilike.%${data.query}%`)
      .limit(10);

    if (error) throw error;
    return users || [];
  });
