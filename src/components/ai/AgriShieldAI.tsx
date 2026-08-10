import { useState } from "react";
import { MessageSquare, X, Send, Leaf, Sparkles, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function AgriShieldAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to AgriShield Intelligence. I am your specialized AI assistant for agricultural risk and decision support. How can I enhance your operations today?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { role: "user", content: inputValue }]);
    setInputValue("");
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm analyzing the market trends and climate data for your specific region. We're seeing a 15% increase in projected yields for pulse crops if irrigation is optimized by week 4." 
      }]);
    }, 1000);
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
            className="group relative h-20 w-20 rounded-full bg-[#0C100D] border border-white/10 shadow-[0_0_50px_rgba(27,77,46,0.3)] flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-primary/50"
          >
            {/* Breathing Glow */}
            <div className="absolute inset-0 bg-primary/20 animate-pulse-gentle" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <Sparkles className="h-8 w-8 text-primary transition-transform duration-500 group-hover:scale-110" />
            </div>
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
            <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold tracking-tight">AgriShield AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expert Systems Online</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-full border border-white/5 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-none">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-muted-foreground rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="px-8 py-4 flex gap-2 overflow-x-auto scrollbar-none">
              {['Risk Assessment', 'Market Trends', 'Pest Control'].map((action) => (
                <button 
                  key={action}
                  onClick={() => setInputValue(action)}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Footer / Input */}
            <div className="p-8 pt-4">
              <div className="relative group">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire about risk intelligence..." 
                  className="h-14 pl-6 pr-14 rounded-full border-white/10 bg-white/5 text-sm focus-visible:ring-primary focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                />
                <Button 
                  size="icon"
                  onClick={handleSend}
                  className="absolute right-1.5 top-1.5 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shadow-lg group-focus-within:scale-105 transition-transform"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
              <p className="mt-4 text-[10px] text-center font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                Powered by AgriShield Neural Engine
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
