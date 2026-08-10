
import { useState } from "react";
import { MessageSquare, Phone, Video, Send, X, User, PhoneCall, VideoIcon, MoreVertical, Search } from "lucide-react";
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

  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video" | null>(null);

  const handleCall = (type: "voice" | "video") => {
    setIsCalling(true);
    setCallType(type);
    toast.info(`Starting ${type} call with ${otherUser.username || "User"}...`, {
      description: "Establishing secure peer connection...",
      duration: 5000,
    });
  };

  const endCall = () => {
    setIsCalling(false);
    setCallType(null);
    toast.success("Call ended");
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 flex h-[600px] w-[400px] flex-col glass-dark border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5">
      {isCalling ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-black/90 relative">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-8"
          >
            <Avatar className="h-32 w-32 ring-4 ring-primary ring-offset-4 ring-offset-black">
              <AvatarImage src={otherUser.avatar_url || ""} />
              <AvatarFallback className="bg-muted text-4xl"><User className="h-16 w-16" /></AvatarFallback>
            </Avatar>
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">{otherUser.username || "User"}</h2>
          <p className="text-primary animate-pulse mb-12">
            {callType === "video" ? "Video calling..." : "Voice calling..."}
          </p>

          {callType === "video" && (
            <div className="absolute top-4 right-4 w-32 h-44 bg-muted rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <User className="h-8 w-8 text-white/20" />
              </div>
            </div>
          )}

          <div className="flex gap-8">
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-transform"
              onClick={endCall}
            >
              <X className="h-8 w-8" />
            </Button>
            <Button 
              size="icon" 
              className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-2xl hover:scale-110 transition-transform"
            >
              {callType === "video" ? <VideoIcon className="h-8 w-8" /> : <PhoneCall className="h-8 w-8" />}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 p-4 bg-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={otherUser.avatar_url || ""} />
                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-bold neon-text-green">
                  {otherUser.username || otherUser.full_name || "User"}
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] text-primary/80 font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => handleCall("voice")}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => handleCall("video")}>
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-red-500/20 hover:text-red-500 transition-colors" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 bg-black/20">
            <ScrollArea className="h-[460px] p-6">
              <div className="flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40">
                    <MessageSquare className="h-12 w-12 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[1.25rem] px-4 py-2.5 text-sm shadow-lg ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-black font-semibold"
                          : "bg-white/10 text-white border border-white/10 backdrop-blur-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-white/10 p-4 bg-white/5">
              <Input
                placeholder="Message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 h-11 focus-visible:ring-primary/50"
              />
              <Button type="submit" size="icon" className="rounded-full h-11 w-11 shadow-lg bg-primary hover:bg-primary/90 transition-transform active:scale-95">
                <Send className="h-5 w-5 text-black" />
              </Button>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
}
