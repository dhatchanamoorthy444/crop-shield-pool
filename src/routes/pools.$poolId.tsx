import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Wallet, Users } from "lucide-react";

export const Route = createFileRoute("/pools/$poolId")({
  component: PoolDetail,
});

interface Pool {
  id: string; name: string; village: string; balance: number;
  join_code: string; default_contribution: number;
}

function PoolDetail() {
  const { poolId } = Route.useParams();
  const { t } = useTranslation();
  const { ready, user } = useRequireAuth();
  const [pool, setPool] = useState<Pool | null>(null);
  const [members, setMembers] = useState<Array<{ user_id: string; full_name: string | null }>>([]);
  const [contribs, setContribs] = useState<Array<{ id: string; amount: number; contributed_at: string; user_id: string }>>([]);
  const [amount, setAmount] = useState("100");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data: p } = await supabase.from("pools").select("*").eq("id", poolId).maybeSingle();
    setPool(p as Pool | null);
    if (p) setAmount(String(p.default_contribution));
    const { data: m } = await supabase.from("pool_members").select("user_id, profiles:profiles!inner(full_name, user_id)").eq("pool_id", poolId);
    setMembers(((m ?? []) as Array<{ user_id: string; profiles: { full_name: string | null } | null }>).map((row) => ({
      user_id: row.user_id, full_name: row.profiles?.full_name ?? null,
    })));
    const { data: c } = await supabase.from("contributions").select("*").eq("pool_id", poolId).order("contributed_at", { ascending: false }).limit(20);
    setContribs((c ?? []) as never);
  };

  useEffect(() => { if (ready) void refresh(); }, [ready, poolId]);

  const contribute = async (e: FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setBusy(true);
    const { error } = await supabase.from("contributions").insert({ pool_id: poolId, user_id: user!.id, amount: amt, method: "simulated" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.success"));
    void refresh();
  };

  if (!ready || !pool) return <div className="min-h-screen bg-gradient-field"><SiteHeader /><p className="p-8 text-muted-foreground">{t("common.loading")}</p></div>;

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/pools"><ArrowLeft className="mr-1 h-4 w-4" /> {t("common.back")}</Link>
        </Button>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{pool.name}</h1>
            <p className="mt-1 text-muted-foreground">{pool.village}</p>
          </div>
          <div className="rounded-xl bg-card px-4 py-2 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("pools.code_label")}</p>
            <p className="font-mono text-2xl font-bold text-primary">{pool.join_code}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="border-border/60 bg-gradient-card">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Wallet className="h-6 w-6" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("pools.balance")}</p>
                <p className="font-display text-2xl font-bold">₹{Number(pool.balance).toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-gradient-card">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-harvest/15 text-soil"><Users className="h-6 w-6" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("dashboard.members")}</p>
                <p className="font-display text-2xl font-bold">{members.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="font-display">{t("pools.contribute")}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={contribute} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amt">{t("pools.contribution_amount")}</Label>
                  <Input id="amt" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {busy ? t("common.loading") : t("pools.record_contribution")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="font-display">{t("pools.recent")}</CardTitle></CardHeader>
            <CardContent>
              {contribs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("pools.no_contributions")}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {contribs.map((c) => {
                    const m = members.find((x) => x.user_id === c.user_id);
                    return (
                      <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-foreground">{m?.full_name ?? "Member"}</span>
                        <span className="font-semibold text-primary">₹{Number(c.amount).toLocaleString("en-IN")}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
