import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: { username: string | null; full_name: string | null; avatar_url: string | null } | null;
};

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_profiles_fkey(username, full_name, avatar_url)")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as unknown as Post[]);
  };

  useEffect(() => {
    const channel = supabase
      .channel("posts_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();
    
    fetchPosts();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { posts };
}
