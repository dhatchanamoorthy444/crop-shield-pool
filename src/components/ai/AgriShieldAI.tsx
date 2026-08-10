import { useState } from "react";
import { MessageSquare, X, Send, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AgriShieldAI() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-premium bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10">
      <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
        <div className="flex items-center gap-2 font-display font-semibold">
          <Leaf className="h-5 w-5" /> AgriShield AI
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          Hello! I'm AgriShield AI. I can help you understand agricultural risks, crops, weather, and management decisions. How can I assist you today?
        </p>
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input placeholder="Ask about risks..." />
        <Button size="icon"><Send className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
