import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_profiles_fkey(username, full_name, avatar_url)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ content: z.string().min(1), image_url: z.string().optional() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        content: data.content,
        image_url: data.image_url,
        user_id: userId
      })
      .select()
      .single();
    if (error) throw error;
    return post;
  });
