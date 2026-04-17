import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Wallet, TrendingUp, Users, Sprout, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — CropShield Pool" }] }),
});

interface PoolSummary {
  id: string;
  name: string;
  village: string;
  balance: number;
  member_count: number;
  my_contributions: number;
}

function Dashboard() {
  const { t } = useTranslation();
  const { ready, profile, user } = useRequireAuth();
  const [pools, setPools] = useState<PoolSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data: memberships } = await supabase
        .from("pool_members")
        .select("pool_id, pools(id, name, village, balance)")
        .eq("user_id", user.id);

      if (!memberships) {
        setLoading(false);
        return;
      }

      const summaries: PoolSummary[] = await Promise.all(
        memberships.map(async (m) => {
          const pool = m.pools as { id: string; name: string; village: string; balance: number } | null;
          if (!pool) return null as unknown as PoolSummary;
          const [{ count: memberCount }, { data: myC }] = await Promise.all([
            supabase.from("pool_members").select("id", { count: "exact", head: true }).eq("pool_id", pool.id),
            supabase.from("contributions").select("amount").eq("pool_id", pool.id).eq("user_id", user.id),
          ]);
          const my_contributions = (myC ?? []).reduce((s, r) => s + Number(r.amount), 0);
          return {
            id: pool.id,
            name: pool.name,
            village: pool.village,
            balance: Number(pool.balance),
            member_count: memberCount ?? 0,
            my_contributions,
          };
        })
      );
      setPools(summaries.filter(Boolean));
      setLoading(false);
    })();
  }, [user]);

  if (!ready) return null;

  const kycBadge = () => {
    if (!profile) return null;
    if (profile.kyc_status === "approved")
      return (
        <Badge className="bg-success text-success-foreground hover:bg-success">
          <ShieldCheck className="mr-1 h-3 w-3" /> {t("dashboard.kyc_approved")}
        </Badge>
      );
    if (profile.kyc_status === "pending")
      return (
        <Badge variant="outline" className="border-harvest/50 text-harvest-foreground">
          <ShieldAlert className="mr-1 h-3 w-3" /> {t("dashboard.kyc_pending")}
        </Badge>
      );
    return (
      <Badge variant="destructive">
        <ShieldAlert className="mr-1 h-3 w-3" /> {t("dashboard.kyc_required")}
      </Badge>
    );
  };

  const totalBalance = pools.reduce((s, p) => s + p.balance, 0);
  const totalContrib = pools.reduce((s, p) => s + p.my_contributions, 0);
  const estCoverage = totalBalance > 0 && pools.length > 0
    ? Math.round(pools.reduce((s, p) => s + (p.member_count > 0 ? p.balance / p.member_count : 0), 0))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{t("dashboard.title")}</p>
            <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {t("dashboard.welcome", { name: profile?.full_name?.split(" ")[0] ?? "" })}
            </h1>
          </div>
          {kycBadge()}
        </div>

        {/* KPI cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <KpiCard icon={Wallet} label={t("dashboard.pool_balance")} value={`₹${totalBalance.toLocaleString("en-IN")}`} />
          <KpiCard icon={TrendingUp} label={t("dashboard.your_contributions")} value={`₹${totalContrib.toLocaleString("en-IN")}`} />
          <KpiCard icon={ShieldCheck} label={t("dashboard.est_coverage")} value={`₹${estCoverage.toLocaleString("en-IN")}`} />
        </div>

        {/* Quick actions */}
        <Card className="mt-8 border-border/60 bg-gradient-card">
          <CardHeader>
            <CardTitle className="font-display">{t("dashboard.quick_actions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionTile to="/pools" icon={Users} label={t("dashboard.join_pool")} />
            <ActionTile to="/simulator" icon={TrendingUp} label={t("dashboard.open_simulator")} />
            <ActionTile to="/prices" icon={Sprout} label={t("nav.prices")} />
            <ActionTile to="/kyc" icon={ShieldCheck} label={t("dashboard.verify_kyc")} />
          </CardContent>
        </Card>

        {/* Pools */}
        <h2 className="mt-10 font-display text-2xl font-bold text-foreground">{t("nav.pools")}</h2>
        {loading ? (
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        ) : pools.length === 0 ? (
          <Card className="mt-4 border-dashed border-border bg-card/60">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-muted-foreground">{t("dashboard.no_pool")}</p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/pools">{t("dashboard.join_pool")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pools.map((p) => (
              <Card key={p.id} className="border-border/60 bg-gradient-card transition hover:shadow-elevated">
                <CardHeader>
                  <CardTitle className="font-display text-lg">{p.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{p.village}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("pools.balance")}</span>
                    <span className="font-semibold">₹{p.balance.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("dashboard.members")}</span>
                    <span className="font-semibold">{p.member_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("dashboard.your_contributions")}</span>
                    <span className="font-semibold">₹{p.my_contributions.toLocaleString("en-IN")}</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                    <Link to="/pools/$poolId" params={{ poolId: p.id }}>
                      {t("pools.open")} <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="border-border/60 bg-gradient-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionTile({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:shadow-soft"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-harvest/15 text-soil">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-foreground group-hover:text-primary">{label}</span>
    </Link>
  );
}
