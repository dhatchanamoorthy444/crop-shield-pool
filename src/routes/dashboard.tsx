import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Wallet, TrendingUp, Users, Sprout, ArrowRight, Share2, Layout } from "lucide-react";
import { PostComposer } from "@/components/posts/PostComposer";
import { Feed } from "@/components/posts/Feed";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — AgriShield" }] }),
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
        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          <ShieldCheck className="mr-1 h-3 w-3" /> {t("dashboard.kyc_approved")}
        </Badge>
      );
    return (
      <Badge variant="outline" className="border-muted text-muted-foreground">
        <ShieldAlert className="mr-1 h-3 w-3" /> {t("dashboard.kyc_required")}
      </Badge>
    );
  };

  const totalBalance = pools.reduce((s, p) => s + p.balance, 0);
  const totalContrib = pools.reduce((s, p) => s + p.my_contributions, 0);

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-foreground">
              Welcome back, {profile?.full_name?.split(" ")[0] ?? "Farmer"}
            </h1>
            <p className="mt-2 text-muted-foreground">Your intelligent risk management dashboard.</p>
          </div>
          {kycBadge()}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <KpiCard icon={Wallet} label="Total Pool Balance" value={`₹${totalBalance.toLocaleString("en-IN")}`} />
              <KpiCard icon={TrendingUp} label="Your Contributions" value={`₹${totalContrib.toLocaleString("en-IN")}`} />
            </div>

            <section>
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Share2 className="h-6 w-6 text-primary" /> Community Feed
              </h2>
              <PostComposer />
              <div className="mt-6">
                <Feed />
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <Card className="border-none shadow-premium rounded-3xl p-2">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <ActionTile to="/pools" icon={Users} label="Manage Pools" />
                <ActionTile to="/simulator" icon={TrendingUp} label="Risk Simulation" />
                <ActionTile to="/prices" icon={Sprout} label="Market Prices" />
                <ActionTile to="/kyc" icon={ShieldCheck} label="KYC Verification" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-none shadow-soft rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="font-display text-3xl font-extrabold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ActionTile({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl p-4 hover:bg-primary/5 transition-all">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <span className="font-bold text-foreground">{label}</span>
      <ArrowRight className="h-5 w-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
    </Link>
  );
}
