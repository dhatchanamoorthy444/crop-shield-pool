
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const searchUsers = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ query: z.string().min(2) }).parse(data))
  .handler(async ({ data }) => {
    // Search by username or full name
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, username, avatar_url")
      .or(`username.ilike.%${data.query}%,full_name.ilike.%${data.query}%`)
      .limit(10);

    if (error) throw error;
    return users;
  });

export const getMessages = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ otherUserId: z.string().uuid() }).parse(data))
  .handler(async ({ data, request }) => {
    // Note: In a real app, we'd use the session user_id from context.
    // For now, we'll assume the caller is authenticated via the middleware.
    // We need to fetch messages where either (sender=me AND receiver=them) OR (sender=them AND receiver=me)
    // This requires the caller's ID, which we get from the Supabase session in the actual implementation.
    return []; // Placeholder until we have the full message table schema
  });
