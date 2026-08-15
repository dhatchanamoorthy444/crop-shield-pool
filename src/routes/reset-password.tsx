import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sprout, Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    title: "Secure Reset — AgriShield PRO",
    meta: [
      { name: "description", content: "Finalize your access recovery with neural-grade encryption." },
      { property: "og:title", content: "Secure Reset — AgriShield PRO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://risk-shield-share.lovable.app/reset-password" },
    ],
  }),
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionActive(!!session);
      if (!loading && !session) {
        toast.error("Recovery session expired or invalid.");
        void nav({ to: "/auth", replace: true });
      }
    };
    checkSession();
  }, [loading, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Cipher must be at least 8 characters.");
    if (password !== confirm) return toast.error("Ciphers do not match.");
    setBusy(true);
    
    const { error } = await supabase.auth.updateUser({ password });
    
    // Log the reset
    await supabase.from("audit_logs").insert({
      event_type: "password_reset",
      status: error ? "failed" : "success",
      metadata: { error: error?.message || null }
    });

    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Access cipher updated. Identity confirmed.");
      void nav({ to: "/dashboard", replace: true });
    }
  };

  if (sessionActive === false) return null;

  return (
    <div className="min-h-screen bg-[#050706] text-white relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-gentle" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse-gentle delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="mb-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-classic text-3xl font-extrabold text-white group uppercase tracking-widest">
            <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary shadow-[0_0_20px_rgba(27,77,46,0.4)] transition-transform">
              <Sprout className="h-7 w-7 text-white" />
            </span>
            AgriShield
          </Link>
        </div>

        <Card className="glass-dark border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <CardHeader className="p-10 pb-0">
            <CardTitle className="text-4xl font-classic font-extrabold mb-3 uppercase tracking-wider italic">Reset Cipher</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium font-friendly">
              Finalize your recovery by establishing a new neural-grade access cipher.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2.5">
                <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">New Access Cipher</Label>
                <Input 
                  className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-medium" 
                  type="password" 
                  required 
                  minLength={8} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Cipher</Label>
                <Input 
                  className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-medium" 
                  type="password" 
                  required 
                  minLength={8} 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={busy} 
                className="w-full h-16 rounded-2xl bg-primary text-white font-classic font-extrabold text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(27,77,46,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                {busy ? "Updating..." : (
                  <span className="flex items-center gap-2">
                    Update Access Cipher
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] backdrop-blur-sm px-4 py-2 rounded-full border border-white/5 bg-white/5">
            <Lock className="h-4 w-4 text-primary" />
            Security Protocol Validated
          </div>
        </div>
      </motion.div>
    </div>
  );
}

