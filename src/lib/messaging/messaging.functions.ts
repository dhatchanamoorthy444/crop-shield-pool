import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const searchUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ query: z.string().min(2) }).parse(data))
  .handler(async ({ data }) => {
    const request = getRequest();
    const token = request?.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: users, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, username, avatar_url")
      .or(`username.ilike.%${data.query}%,full_name.ilike.%${data.query}%`)
      .limit(10);

    if (error) throw error;
    return users || [];
  });
