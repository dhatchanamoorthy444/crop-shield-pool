import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createPost } from "@/lib/posts/posts.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function PostComposer() {
  const [content, setContent] = useState("");
  const postFn = useServerFn(createPost);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await postFn({ data: { content } });
      setContent("");
      toast.success("Post shared!");
    } catch {
      toast.error("Failed to share post");
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-soft space-y-3">
      <Textarea 
        placeholder="Share your work details or farming idea..." 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-none border-border/50 focus-visible:ring-primary/20"
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Post
        </Button>
      </div>
    </div>
  );
}
