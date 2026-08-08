
import { useState } from "react";
import { Search, UserPlus, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useServerFn } from "@tanstack/react-start";
import { searchUsers } from "@/lib/messaging/messaging.functions";
import { ChatBox } from "./ChatBox";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const search = useServerFn(searchUsers);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 1) {
      try {
        const users = await search({ data: { query: val } });
        setResults(users);
      } catch (e) {
        console.error(e);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by username..."
          className="pl-8"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {results.map((u) => (
            <button
              key={u.user_id}
              onClick={() => {
                setActiveChat(u);
                setResults([]);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={u.avatar_url} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">@{u.username}</div>
                <div className="text-xs text-muted-foreground">{u.full_name}</div>
              </div>
              <MessageSquare className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {activeChat && (
        <ChatBox 
          otherUser={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}
