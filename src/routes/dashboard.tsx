import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Wallet, TrendingUp, Users, Sprout, ArrowRight, Share2, Layout, Activity, Leaf, Brain, ArrowUpRight } from "lucide-react";
import { PostComposer } from "@/components/posts/PostComposer";
import { Feed } from "@/components/posts/Feed";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AgriShieldAI } from "@/components/ai/AgriShieldAI";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ 
    title: "Intelligence Hub — AgriShield",
    meta: [
      { name: "description", content: "Manage your farm risks, community pools, and contributions." },
    ]
  }),
});

interface PoolSummary {
  id: string;
  name: string;
  village: string;
  balance: number;
  member_count: number;
  my_contributions: number;
}

const chartData = [
  { name: 'Mon', risk: 65 },
  { name: 'Tue', risk: 68 },
  { name: 'Wed', risk: 72 },
  { name: 'Thu', risk: 70 },
  { name: 'Fri', risk: 75 },
  { name: 'Sat', risk: 72 },
  { name: 'Sun', risk: 72 },
];

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

  const totalBalance = pools.reduce((s, p) => s + p.balance, 0);
  const totalContrib = pools.reduce((s, p) => s + p.my_contributions, 0);

  return (
    <div className="min-h-screen bg-[#050706] text-white">
      <SiteHeader />
      
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Cinematic Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-4 neon-text-green">
              Intelligence <span className="text-primary italic">Hub</span>
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live Network Feed
              </div>
              <span>Protocol Active: {profile?.full_name ?? "User"}</span>
            </div>
          </motion.div>
          
          {profile?.kyc_status === "approved" ? (
            <Badge className="h-10 px-6 rounded-full bg-primary/10 text-primary border-primary/20 flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase">
              <ShieldCheck className="h-4 w-4" /> Identity Verified
            </Badge>
          ) : (
            <Link to="/kyc">
              <Badge className="h-10 px-6 rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase hover:bg-amber-500/20 transition-colors">
                <ShieldAlert className="h-4 w-4" /> Verification Required
              </Badge>
            </Link>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Intelligence Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* KPI Row */}
            <div className="grid gap-6 sm:grid-cols-3">
              <KpiCard icon={Activity} label="Risk Index" value="72" trend="+2.4%" />
              <KpiCard icon={Wallet} label="Total Assets" value={`₹${totalBalance.toLocaleString("en-IN")}`} trend="Stable" />
              <KpiCard icon={TrendingUp} label="Personal Stake" value={`₹${totalContrib.toLocaleString("en-IN")}`} trend="Active" />
            </div>

            {/* Risk Intelligence Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-dark p-8 rounded-[2.5rem] border-white/10"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">Risk Trajectory</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Historical Trend Analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Network Average</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B4D2E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1B4D2E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0C100D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontWeight: 700 }}
                      itemStyle={{ color: '#1B4D2E' }}
                    />
                    <Area type="monotone" dataKey="risk" stroke="#1B4D2E" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Community Feed Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl font-bold flex items-center gap-4">
                  <Share2 className="h-8 w-8 text-primary" /> Network Intelligence Feed
                </h2>
              </div>
              <div className="glass-dark p-2 rounded-[2.5rem] border-white/5">
                <PostComposer />
                <div className="p-6">
                  <Feed />
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar - Action Protocol */}
          <aside className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-dark p-2 rounded-[2.5rem] border-white/10"
            >
              <div className="p-8 pb-4">
                <h3 className="font-display text-xl font-extrabold flex items-center gap-3 mb-2">
                  <Layout className="h-6 w-6 text-primary" />
                  Protocol Entry
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Action Gateway</p>
              </div>
              <div className="p-4 pt-0 space-y-2">
                <ActionTile to="/pools" icon={Users} label="Risk Pools" desc="Cooperative Capital" />
                <ActionTile to="/simulator" icon={TrendingUp} label="Simulator" desc="Scenario Engine" />
                <ActionTile to="/prices" icon={Sprout} label="Market Hub" desc="Live Price Data" />
                <ActionTile to="/kyc" icon={ShieldCheck} label="Verification" desc="Identity Protocol" />
              </div>
            </motion.div>

            {/* AI Assistant Insight Card */}
            <div className="glass-dark p-8 rounded-[2.5rem] border-white/5 bg-primary/5">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 mb-6">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-bold mb-3">AI Strategic Brief</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                "We recommend diversifying your risk contribution towards the Monsoon-Alpha pool given the 12% increase in regional rainfall probability."
              </p>
              <Button asChild variant="ghost" className="w-full justify-between h-12 rounded-xl border-white/10 hover:bg-white/5 group">
                Consult Neural Assistant
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <AgriShieldAI />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-dark p-8 rounded-[2.5rem] border-white/5 transition-all"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
        <p className="font-display text-4xl font-extrabold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}

function ActionTile({ to, icon: Icon, label, desc }: { to: string; icon: any; label: string; desc: string }) {
  return (
    <Link to={to} className="group flex items-center gap-5 rounded-[1.5rem] p-5 hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-primary border border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <span className="block font-bold text-base leading-tight">{label}</span>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{desc}</span>
      </div>
      <div className="ml-auto h-10 w-10 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-primary group-hover:text-white group-hover:translate-x-1">
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </Link>
  );
}
