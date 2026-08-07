import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { toast } from "sonner";
import { Sprout, ShieldCheck } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in or join — CropShield Pool" },
      {
        name: "description",
        content: "Create your CropShield Pool account to join a village risk-pool, verify your ID securely and track contributions.",
      },
      { property: "og:title", content: "Sign in to CropShield Pool" },
      { property: "og:description", content: "Join a village risk-pool. Encrypted, verified, multi-language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  if (m.includes("pwned") || m.includes("weak"))
    return "That password appears in known data breaches. Please choose a stronger one.";
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
    <div className="min-h-screen bg-gradient-field">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-soft">
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </span>
            {t("brand")}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <Card className="border-border/60 shadow-elevated">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-lg">
              <TabsTrigger value="signin">{t("auth.signin_title")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup_title")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="m-0">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="m-0">
              <SignUpForm currentLang={i18n.language} />
            </TabsContent>
          </Tabs>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Your details are encrypted in transit and at rest.
        </p>
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
      toast.success(t("common.success"));
      void nav({ to: "/dashboard", replace: true });
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      toast.error("Enter your email first, then tap “Forgot password”.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(friendly(error.message));
    toast.success("Password reset link sent. Check your email.");
  };

  return (
    <form onSubmit={submit}>
      <CardHeader>
        <CardTitle className="font-display">{t("auth.signin_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="si-email">{t("auth.email")}</Label>
          <Input id="si-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="si-password">{t("auth.password")}</Label>
          <Input
            id="si-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {busy ? t("common.loading") : t("auth.submit_signin")}
        </Button>
        <button type="button" onClick={forgot} className="w-full text-center text-xs font-medium text-primary hover:underline">
          Forgot password?
        </button>
      </CardContent>
    </form>
  );
}

function SignUpForm({ currentLang }: { currentLang: string }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"farmer" | "leader" | "official">("farmer");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, email, password, phone, role });
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
          phone: phone.trim(),
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
      toast.success("Account created. Welcome!");
      void nav({ to: "/dashboard", replace: true });
    } else {
      toast.success("Check your email to confirm your account.");
    }
  };

  return (
    <form onSubmit={submit}>
      <CardHeader>
        <CardTitle className="font-display">{t("auth.signup_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="su-name">{t("auth.full_name")}</Label>
          <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-email">{t("auth.email")}</Label>
          <Input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-password">{t("auth.password")}</Label>
          <Input
            id="su-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-phone">{t("auth.phone")}</Label>
          <Input id="su-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t("auth.role")}</Label>
          <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="farmer">{t("auth.role_farmer")}</SelectItem>
              <SelectItem value="leader">{t("auth.role_leader")}</SelectItem>
              <SelectItem value="official">{t("auth.role_official")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {busy ? t("common.loading") : t("auth.submit_signup")}
        </Button>
      </CardContent>
    </form>
  );
}
