
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const searchUsers = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ query: z.string().min(2) }).parse(data))
  .handler(async ({ data }) => {
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, username, avatar_url")
      .or(`username.ilike.%${data.query}%,full_name.ilike.%${data.query}%`)
      .limit(10);

    if (error) throw error;
    return users || [];
  });
