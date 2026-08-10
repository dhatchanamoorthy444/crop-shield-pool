import { useState } from "react";
import { X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { askAgriShieldAI } from "@/lib/ai/agri-ai.functions";
import aiMark from "@/assets/agrishield-ai-mark.png";

type ChatMessage = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS = [
  "Assess my drought risk",
  "Wheat price outlook",
  "Pest pressure this week",
];

export function AgriShieldAI() {
  const ask = useServerFn(askAgriShieldAI);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"ready" | "submitted">("ready");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to **AgriShield Intelligence**. Ask me about crop risk, weather exposure, irrigation timing, market trends, or how your risk pool works.",
    },
  ]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || status === "submitted") return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setStatus("submitted");
    try {
      const result = await ask({
        data: { messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: result.content }]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "AgriShield AI is unavailable.";
      toast.error(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setStatus("ready");
    }
  };

  const handleSubmit = (message: PromptInputMessage, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(message.text ?? "");
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AgriShield AI"
            className="group relative h-20 w-20 rounded-full bg-[#0C100D] border border-white/10 shadow-[0_0_50px_rgba(212,163,115,0.25)] flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-primary/50"
          >
            <div className="absolute inset-0 bg-primary/20 animate-pulse-gentle" />
            <img
              src={aiMark}
              alt="AgriShield AI"
              loading="lazy"
              width={512}
              height={512}
              className="relative z-10 h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-dark w-[450px] max-w-[90vw] h-[650px] max-h-[80vh] rounded-[2.5rem] border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/30">
                  <img
                    src={aiMark}
                    alt=""
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-business text-xl font-extrabold tracking-tight">AgriShield AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Live intelligence
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="h-10 w-10 rounded-full border border-white/5 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Transcript */}
            <Conversation className="flex-1">
              <ConversationContent className="gap-4 px-6 py-6">
                {messages.map((msg, i) => (
                  <Message from={msg.role} key={i}>
                    {msg.role === "assistant" ? (
                      <MessageContent className="bg-transparent px-0 text-foreground">
                        <MessageResponse>{msg.content}</MessageResponse>
                      </MessageContent>
                    ) : (
                      <MessageContent className="bg-primary text-primary-foreground">
                        {msg.content}
                      </MessageContent>
                    )}
                  </Message>
                ))}
                {status === "submitted" && (
                  <Message from="assistant">
                    <MessageContent className="bg-transparent px-0">
                      <span className="flex items-center gap-2 text-sm">
                        <Brain className="h-4 w-4 text-primary" />
                        <Shimmer>Analysing field intelligence...</Shimmer>
                      </span>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {/* Quick actions */}
            <div className="px-6 pb-2 flex gap-2 overflow-x-auto">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => void send(action)}
                  disabled={status === "submitted"}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all disabled:opacity-40"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Composer */}
            <div className="p-6 pt-2">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputTextarea placeholder="Ask about risk, weather, prices or pools..." />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={status === "submitted"} />
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-3 text-[10px] text-center font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                AgriShield neural engine
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
