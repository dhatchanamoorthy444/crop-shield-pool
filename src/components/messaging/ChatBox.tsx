
import { useState } from "react";
import { MessageSquare, Phone, Video, Send, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/messaging/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatBoxProps {
  otherUser: {
    user_id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  onClose: () => void;
}

export function ChatBox({ otherUser, onClose }: ChatBoxProps) {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat(otherUser.user_id);
  const [content, setContent] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      await sendMessage(content);
      setContent("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleCall = () => {
    toast.info("Calling " + (otherUser.username || "User") + "...");
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 flex h-[500px] w-[350px] flex-col shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5">
      <CardHeader className="flex flex-row items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser.avatar_url || ""} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-bold">
              {otherUser.username || otherUser.full_name || "User"}
            </CardTitle>
            <span className="text-[10px] text-green-500">Active now</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCall}>
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[380px] p-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t p-3">
          <Input
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
