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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/pools/")({
  component: PoolsPage,
  head: () => ({ 
    title: "Cooperative Risk Pools — AgriShield PRO",
    meta: [
      { name: "description", content: "Join or lead village cooperatives with digital risk-pools for automated agricultural protection." },
      { property: "og:title", content: "Village Pools — AgriShield PRO" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ]
  }),
});

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function PoolsPage() {
  const { t } = useTranslation();
  const { ready, user, roles } = useRequireAuth();
  const [myPools, setMyPools] = useState<Array<{ id: string; name: string; village: string; balance: number; join_code: string }>>([]);
  const canCreate = roles.includes("leader") || roles.includes("official");

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pool_members")
      .select("pools(id, name, village, balance)")
      .eq("user_id", user.id);
      
    const poolList = (data ?? []).map((r) => r.pools).filter(Boolean) as any[];
    
    // Load join codes for these pools via secure RPC
    const poolsWithCodes = await Promise.all(
      poolList.map(async (p) => {
        const { data: code } = await supabase.rpc("get_pool_join_code", { _pool_id: p.id });
        return { ...p, join_code: code || "PRIVATE" };
      })
    );
    
    setMyPools(poolsWithCodes);
  };

  useEffect(() => { void refresh(); }, [user]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{t("pools.title")}</h1>

        <Tabs defaultValue="join" className="mt-6">
          <TabsList>
            <TabsTrigger value="join">{t("pools.join_title")}</TabsTrigger>
            {canCreate && <TabsTrigger value="create">{t("pools.create_title")}</TabsTrigger>}
          </TabsList>
          <TabsContent value="join">
            <JoinForm onJoined={refresh} userId={user!.id} />
          </TabsContent>
          {canCreate && (
            <TabsContent value="create">
              <CreateForm onCreated={refresh} userId={user!.id} />
            </TabsContent>
          )}
        </Tabs>

        <h2 className="mt-10 font-display text-2xl font-bold text-foreground">My pools</h2>
        {myPools.length === 0 ? (
          <p className="mt-3 text-muted-foreground">{t("dashboard.no_pool")}</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {myPools.map((p) => (
              <Card key={p.id} className="border-border/60 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">{p.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{p.village}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("pools.balance")}</span>
                    <span className="font-semibold">₹{Number(p.balance).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("pools.join_code")}</span>
                    <span className="font-mono text-base font-bold text-primary">{p.join_code}</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                    <Link to="/pools/$poolId" params={{ poolId: p.id }}>{t("pools.open")}</Link>
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

const joinSchema = z.object({ code: z.string().trim().length(6).regex(/^[A-Z2-9]+$/) });

function JoinForm({ onJoined, userId }: { onJoined: () => void; userId: string }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = joinSchema.safeParse({ code: code.toUpperCase() });
    if (!parsed.success) { toast.error("Enter a valid 6-letter code"); return; }
    setBusy(true);
    // Use the secure join RPC instead of manual check + insert
    const { data: poolId, error } = await supabase.rpc("join_pool_by_code", { _code: parsed.data.code });
    
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (!poolId) { toast.error("Pool not found"); return; }
    toast.success("Joined!");
    setCode("");
    onJoined();
  };
  return (
    <Card className="mt-4 border-border/60 bg-gradient-card">
      <CardContent className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-code">{t("pools.enter_code")}</Label>
            <Input id="join-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono text-lg tracking-widest" />
          </div>
          <Button type="submit" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {busy ? t("common.loading") : t("pools.join_btn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  village: z.string().trim().min(1).max(120),
  district: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  default_contribution: z.number().min(10).max(100000),
  crops: z.string().max(500).optional(),
});

function CreateForm({ onCreated, userId }: { onCreated: () => void; userId: string }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", village: "", district: "", state: "", contribution: "100", crops: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = createSchema.safeParse({
      name: form.name, village: form.village, district: form.district, state: form.state,
      default_contribution: Number(form.contribution), crops: form.crops,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid"); return; }
    setBusy(true);
    const join_code = genCode();
    const target_crops = (form.crops || "").split(",").map((c) => c.trim()).filter(Boolean);
    const { data: pool, error } = await supabase.from("pools").insert({
      name: parsed.data.name, village: parsed.data.village,
      district: parsed.data.district || null, state: parsed.data.state || null,
      default_contribution: parsed.data.default_contribution,
      target_crops, created_by: userId, join_code,
    }).select().single();
    if (error || !pool) { setBusy(false); toast.error(error?.message ?? "Failed"); return; }
    await supabase.from("pool_members").insert({ pool_id: pool.id, user_id: userId });
    setBusy(false);
    toast.success(`Pool created. Code: ${join_code}`);
    setForm({ name: "", village: "", district: "", state: "", contribution: "100", crops: "" });
    onCreated();
  };
  return (
    <Card className="mt-4 border-border/60 bg-gradient-card">
      <CardContent className="p-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>{t("pools.name")}</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t("pools.village")}</Label><Input required value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t("pools.district")}</Label><Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t("pools.state")}</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          <div className="space-y-2"><Label>{t("pools.default_contribution")}</Label><Input type="number" min={10} required value={form.contribution} onChange={(e) => setForm({ ...form, contribution: e.target.value })} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>{t("pools.crops")}</Label><Input placeholder="Paddy, Wheat" value={form.crops} onChange={(e) => setForm({ ...form, crops: e.target.value })} /></div>
          <Button type="submit" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90 sm:col-span-2">
            {busy ? t("common.loading") : t("pools.create_btn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
