import { usePosts } from "@/lib/posts/usePosts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export function Feed() {
  const { posts } = usePosts();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
        No posts yet. Be the first to share!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="rounded-xl border border-border/60 bg-gradient-card p-4 shadow-soft transition hover:shadow-elevated">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 border border-primary/10">
              <AvatarImage src={post.profiles?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm text-foreground">
                {post.profiles?.full_name || `@${post.profiles?.username}`}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.content}</p>
        </div>
      ))}
    </div>
  );
}
