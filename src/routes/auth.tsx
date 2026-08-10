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
import { Leaf, ShieldCheck, Lock } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Authentication — AgriShield" },
      {
        name: "description",
        content: "Securely access your AgriShield dashboard. Risk management intelligence for modern agriculture.",
      },
      { property: "og:title", content: "AgriShield Login" },
      { property: "og:description", content: "Access intelligent agricultural risk management tools." },
      { property: "og:type", content: "website" },
    ],
  }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  phone: z.string().trim().max(20).optional(),
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
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display text-2xl font-bold text-primary group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft group-hover:scale-105 transition-transform">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </span>
            AgriShield
          </Link>
          <LanguageSwitcher compact />
        </div>

        <Card className="border-none shadow-premium bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1.5 h-auto">
              <TabsTrigger value="signin" className="rounded-2xl py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-2xl py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Join Now
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-0">
              <SignUpForm currentLang={i18n.language} />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <Lock className="h-3 w-3 text-primary" />
            Enterprise-grade Security
          </div>
          <p className="text-xs text-center text-muted-foreground max-w-[280px]">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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
      toast.success("Welcome back to AgriShield");
      void nav({ to: "/dashboard", replace: true });
    }
  };

  return (
    <form onSubmit={submit} className="p-8">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-extrabold font-display">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
          <Input className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 rounded-xl" type="email" placeholder="farmer@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
            <Link to="/reset-password" onClick={(e) => { e.preventDefault(); /* trigger forgot pass flow */ }} className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
          </div>
          <Input className="h-12 bg-muted/30 border-none focus-visible:ring-primary/20 rounded-xl" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-primary font-bold shadow-soft">
          {busy ? "Signing in..." : "Sign In to Dashboard"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ currentLang }: { currentLang: string }) {
  const { t } = useTranslation();
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
    <form onSubmit={submit} className="p-8">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-extrabold font-display">Create Account</CardTitle>
        <CardDescription>Join 500+ agricultural stakeholders today.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
            <Input className="h-12 bg-muted/30 border-none rounded-xl" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="h-12 bg-muted/30 border-none rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold">
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="leader">FPO Leader</SelectItem>
                <SelectItem value="official">Agri Official</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
          <Input className="h-12 bg-muted/30 border-none rounded-xl" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
          <Input className="h-12 bg-muted/30 border-none rounded-xl" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-primary font-bold shadow-soft">
          {busy ? "Creating Account..." : "Create My Account"}
        </Button>
      </div>
    </form>
  );
}
