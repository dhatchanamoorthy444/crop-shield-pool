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
import { Sprout } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — CropShield Pool" }] }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(["farmer", "leader", "official"]),
});

function AuthPage() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) void nav({ to: "/dashboard" });
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
      </div>
    </div>
  );
}

function SignInForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("common.success"));
  };

  return (
    <form onSubmit={submit}>
      <CardHeader>
        <CardTitle className="font-display">{t("auth.signin_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="si-email">{t("auth.email")}</Label>
          <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="si-password">{t("auth.password")}</Label>
          <Input id="si-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {busy ? t("common.loading") : t("auth.submit_signin")}
        </Button>
      </CardContent>
    </form>
  );
}

function SignUpForm({ currentLang }: { currentLang: string }) {
  const { t } = useTranslation();
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
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone,
          role,
          language: ["en", "hi", "ta", "kn"].includes(currentLang) ? currentLang : "en",
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("common.success"));
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
          <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="su-password">{t("auth.password")}</Label>
          <Input id="su-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
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
