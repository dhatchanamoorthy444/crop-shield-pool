import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const searchUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ query: z.string().min(2) }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context as any;
    if (!userId) throw new Error("Unauthorized");

    const { data: users, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, username, avatar_url")
      .or(`username.ilike.%${data.query}%,full_name.ilike.%${data.query}%`)
      .limit(10);

    if (error) throw error;
    return users || [];
  });
