import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { Leaf, ShieldCheck, Lock, ArrowRight, Sparkles } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    title: "Secure Access — AgriShield PRO Authentication",
    meta: [
      {
        name: "description",
        content: "Securely access your AgriShield PRO dashboard. Managed agricultural risk intelligence with neural-grade encryption.",
      },
      { property: "og:title", content: "Secure Access — AgriShield PRO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://risk-shield-share.lovable.app/auth" },
    ],
  }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["farmer", "leader", "official"]),
});

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Please confirm your email, then sign in.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That email already has an account — try signing in instead.";
  return message;
}

function AuthPage() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) void nav({ to: "/dashboard", replace: true });
  }, [user, loading, nav]);

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
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="mb-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-classic text-3xl font-extrabold text-white group uppercase tracking-widest">
            <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary shadow-[0_0_20px_rgba(27,77,46,0.4)] group-hover:scale-105 transition-transform">
              <Leaf className="h-7 w-7 text-white" />
            </span>
            AgriShield
          </Link>
          <div className="glass-dark px-2 py-1 rounded-full border-white/5">
            <LanguageSwitcher compact />
          </div>
        </div>

        <Card className="glass-dark border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-2 h-auto rounded-none border-b border-white/5">
              <TabsTrigger 
                value="signin" 
                className="rounded-2xl py-3.5 font-classic font-extrabold text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-2xl py-3.5 font-classic font-extrabold text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Join Now
              </TabsTrigger>
              <TabsTrigger 
                value="forgot" 
                className="rounded-2xl py-3.5 font-classic font-extrabold text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Reset
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-0">
              <SignUpForm currentLang={i18n.language} />
            </TabsContent>
            <TabsContent value="forgot" className="mt-0">
              <ForgotPasswordForm />
            </TabsContent>
          </Tabs>
        </Card>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] backdrop-blur-sm px-4 py-2 rounded-full border border-white/5 bg-white/5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Neural-Grade Encryption Active
          </div>
          <p className="text-[10px] text-center text-muted-foreground/40 max-w-[320px] font-bold uppercase tracking-widest leading-loose">
            Secure entry protocol initiated. By continuing, you authorize the terms of the AgriShield Intelligence Network.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SignInForm() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) toast.error(friendly(error.message));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(friendly(error.message));
      return;
    }
    if (data.session) {
      toast.success("Identity Verified. Welcome back.");
      void nav({ to: "/dashboard", replace: true });
    }
  };

  return (
    <div className="p-10 space-y-8">
      <div>
        <h2 className="text-4xl font-classic font-extrabold mb-3 uppercase tracking-wider italic">Welcome Back</h2>
        <p className="text-muted-foreground text-sm font-medium font-friendly">Re-establish your connection to the risk network.</p>
      </div>

      <div className="space-y-6">
        <Button 
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-3 transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.27l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
            <span className="bg-transparent px-4 text-muted-foreground font-bold">Or authorize with cipher</span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2.5">
            <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Network Identifier</Label>
            <Input 
              className="h-14 bg-white/5 border-white/10 focus-visible:ring-primary/40 rounded-2xl px-6 font-medium placeholder:text-muted-foreground/20" 
              type="email" 
              placeholder="farmer@network.ag" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center ml-1">
              <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Access Cipher</Label>
              <TabsTrigger value="forgot" asChild>
                <button type="button" className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest">Forgot Cipher?</button>
              </TabsTrigger>
            </div>
            <Input 
              className="h-14 bg-white/5 border-white/10 focus-visible:ring-primary/40 rounded-2xl px-6 font-medium" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={busy} 
            className="w-full h-16 rounded-2xl bg-primary text-white font-classic font-extrabold text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(27,77,46,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            {busy ? "Verifying..." : (
              <span className="flex items-center gap-2">
                Authorize Access
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function SignUpForm({ currentLang }: { currentLang: string }) {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "leader" | "official">("farmer");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, email, password, role });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName.trim(),
          role,
          language: ["en", "hi", "ta", "kn"].includes(currentLang) ? currentLang : "en",
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(friendly(error.message));
      return;
    }
    if (data.session) {
      toast.success("Welcome to AgriShield!");
      void nav({ to: "/dashboard", replace: true });
    } else {
      toast.success("Check your email to confirm your account.");
    }
  };

  return (
    <form onSubmit={submit} className="p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-display font-extrabold mb-3">Join the Network</h2>
        <p className="text-muted-foreground text-sm font-medium">Initialize your profile within the AgriShield ecosystem.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Identity</Label>
            <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-medium" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2.5">
            <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Network Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-dark border-white/10 rounded-2xl font-bold">
                <SelectItem value="farmer" className="rounded-xl">Farmer</SelectItem>
                <SelectItem value="leader" className="rounded-xl">FPO Leader</SelectItem>
                <SelectItem value="official" className="rounded-xl">Agri Official</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2.5">
          <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Identifier</Label>
          <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-medium" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2.5">
          <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure Cipher</Label>
          <Input className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-medium" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        
        <Button 
          type="submit" 
          disabled={busy} 
          className="w-full h-16 rounded-2xl bg-primary text-white font-display font-extrabold text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(27,77,46,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          {busy ? "Initializing..." : (
            <span className="flex items-center gap-2">
              Create My Identity
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(friendly(error.message));
    } else {
      toast.success("Recovery instructions dispatched to your network identifier.");
    }
  };

  return (
    <div className="p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-classic font-extrabold mb-3 uppercase tracking-wider italic">Recover Access</h2>
        <p className="text-muted-foreground text-sm font-medium font-friendly">Enter your identifier to reset your access cipher.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="space-y-2.5">
          <Label className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-1">Network Identifier</Label>
          <Input 
            className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-medium placeholder:text-muted-foreground/20" 
            type="email" 
            placeholder="farmer@network.ag" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={busy} 
          className="w-full h-16 rounded-2xl bg-primary text-white font-classic font-extrabold text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(27,77,46,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          {busy ? "Dispatching..." : (
            <span className="flex items-center gap-2">
              Send Recovery Instructions
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
