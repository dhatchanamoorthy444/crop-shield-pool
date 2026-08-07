import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sprout } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Set a new password — CropShield Pool" },
      { name: "description", content: "Choose a new password for your CropShield Pool account." },
      { property: "og:title", content: "Reset your CropShield Pool password" },
      { property: "og:description", content: "Choose a new password for your CropShield Pool account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You are signed in.");
    void nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-field">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
        <Link to="/" className="mb-6 flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-soft">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </span>
          CropShield Pool
        </Link>
        <Card className="border-border/60 shadow-elevated">
          <form onSubmit={submit}>
            <CardHeader>
              <CardTitle className="font-display">Set a new password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rp-pass">New password</Label>
                <Input id="rp-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rp-confirm">Confirm password</Label>
                <Input id="rp-confirm" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {busy ? "Saving…" : "Update password"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
