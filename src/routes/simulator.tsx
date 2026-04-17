import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

export const Route = createFileRoute("/simulator")({
  component: Simulator,
  head: () => ({ meta: [{ title: "Simulator — CropShield" }] }),
});

type Scenario = "normal" | "drought" | "flood" | "pest";
const SCENARIO_MULTIPLIER: Record<Scenario, number> = { normal: 1, drought: 1.4, flood: 1.3, pest: 1.25 };

function Simulator() {
  const { t } = useTranslation();
  const [farmers, setFarmers] = useState(50);
  const [contribution, setContribution] = useState(200);
  const [months, setMonths] = useState(6);
  const [topup, setTopup] = useState(20);
  const [yieldLoss, setYieldLoss] = useState(40);
  const [scenario, setScenario] = useState<Scenario>("normal");

  const result = useMemo(() => {
    const baseContributions = farmers * contribution * months;
    const topupAmount = baseContributions * (topup / 100);
    const poolBalance = baseContributions + topupAmount;
    const adjustedYieldLoss = Math.min(100, yieldLoss * SCENARIO_MULTIPLIER[scenario]);
    const baselineSeasonIncome = 25000;
    const incomeNoPool = baselineSeasonIncome * (1 - adjustedYieldLoss / 100);
    const debtNoPool = Math.max(0, baselineSeasonIncome - incomeNoPool);
    const payoutPerFarmer = Math.round((poolBalance * (adjustedYieldLoss / 100) * 0.6) / farmers);
    const incomeWithPool = incomeNoPool + payoutPerFarmer;
    const debtWithPool = Math.max(0, debtNoPool - payoutPerFarmer);
    const debtAvoided = debtNoPool - debtWithPool;

    const series = Array.from({ length: months }, (_, i) => ({
      month: `M${i + 1}`,
      balance: Math.round((baseContributions / months) * (i + 1) + topupAmount * ((i + 1) / months)),
    }));

    return { poolBalance, payoutPerFarmer, incomeNoPool, incomeWithPool, debtNoPool, debtWithPool, debtAvoided, series };
  }, [farmers, contribution, months, topup, yieldLoss, scenario]);

  const compareData = [
    { name: t("sim.income_no_pool"), Income: Math.round(result.incomeNoPool), Debt: Math.round(result.debtNoPool) },
    { name: t("sim.income_with_pool"), Income: Math.round(result.incomeWithPool), Debt: Math.round(result.debtWithPool) },
  ];

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{t("sim.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("sim.subtitle")}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="border-border/60 bg-gradient-card">
            <CardHeader><CardTitle className="font-display">Inputs</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <SliderField label={`${t("sim.farmers")}: ${farmers}`} min={5} max={500} step={5} value={farmers} onChange={setFarmers} />
              <SliderField label={`${t("sim.contribution")}: ₹${contribution}`} min={50} max={2000} step={50} value={contribution} onChange={setContribution} />
              <SliderField label={`${t("sim.months")}: ${months}`} min={1} max={12} step={1} value={months} onChange={setMonths} />
              <SliderField label={`${t("sim.topup")}: ${topup}%`} min={0} max={100} step={5} value={topup} onChange={setTopup} />
              <SliderField label={`${t("sim.yield_loss")}: ${yieldLoss}%`} min={0} max={100} step={5} value={yieldLoss} onChange={setYieldLoss} />
              <div className="space-y-2">
                <Label>{t("sim.scenario")}</Label>
                <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t("sim.sc_normal")}</SelectItem>
                    <SelectItem value="drought">{t("sim.sc_drought")}</SelectItem>
                    <SelectItem value="flood">{t("sim.sc_flood")}</SelectItem>
                    <SelectItem value="pest">{t("sim.sc_pest")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label={t("sim.pool_balance")} value={`₹${result.poolBalance.toLocaleString("en-IN")}`} />
              <Stat label={t("sim.payout_per_farmer")} value={`₹${result.payoutPerFarmer.toLocaleString("en-IN")}`} accent />
              <Stat label={t("sim.debt_reduction")} value={`₹${Math.round(result.debtAvoided).toLocaleString("en-IN")}`} />
            </div>

            <Card className="border-border/60 bg-gradient-card">
              <CardHeader><CardTitle className="font-display">{t("sim.chart_title")}</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="Income" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Debt" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-card">
              <CardHeader><CardTitle className="font-display">Pool balance over season</CardTitle></CardHeader>
              <CardContent style={{ height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={result.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="balance" stroke="var(--harvest)" strokeWidth={3} dot={{ fill: "var(--harvest)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 text-sm leading-relaxed text-foreground">
                {t("sim.summary", {
                  contribution, farmers,
                  payout: result.payoutPerFarmer.toLocaleString("en-IN"),
                  saved: Math.round(result.debtAvoided).toLocaleString("en-IN"),
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function SliderField({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0] ?? min)} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className={accent ? "border-harvest/40 bg-harvest/10" : "border-border/60 bg-gradient-card"}>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
