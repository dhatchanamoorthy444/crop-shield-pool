import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/prices")({
  component: Prices,
  head: () => ({ meta: [{ title: "Market Prices — AgriShield" }] }),
});

const CROPS = ["Paddy", "Wheat", "Tomato", "Cotton"] as const;

function Prices() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<(typeof CROPS)[number]>("Paddy");
  const [data, setData] = useState<Array<{ recorded_on: string; price_per_quintal: number }>>([]);

  useEffect(() => {
    void (async () => {
      const { data: rows } = await supabase
        .from("market_prices")
        .select("recorded_on, price_per_quintal")
        .eq("crop", crop)
        .order("recorded_on", { ascending: true });
      setData((rows ?? []).map((r) => ({ recorded_on: r.recorded_on, price_per_quintal: Number(r.price_per_quintal) })));
    })();
  }, [crop]);

  const stats = useMemo(() => {
    if (data.length < 2) return { current: 0, change7: 0, change30: 0 };
    const current = data[data.length - 1].price_per_quintal;
    const seven = data[Math.max(0, data.length - 8)]?.price_per_quintal ?? current;
    const thirty = data[0].price_per_quintal;
    return {
      current,
      change7: ((current - seven) / seven) * 100,
      change30: ((current - thirty) / thirty) * 100,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{t("prices.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("prices.subtitle")}</p>

        <div className="mt-6 max-w-xs space-y-2">
          <Label>{t("prices.select_crop")}</Label>
          <Select value={crop} onValueChange={(v) => setCrop(v as typeof crop)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <PriceStat label={t("prices.current")} value={`₹${Math.round(stats.current).toLocaleString("en-IN")}`} />
          <PriceStat label={t("prices.change_7d")} value={`${stats.change7.toFixed(1)}%`} positive={stats.change7 >= 0} showArrow />
          <PriceStat label={t("prices.change_30d")} value={`${stats.change30.toFixed(1)}%`} positive={stats.change30 >= 0} showArrow />
        </div>

        <Card className="mt-6 border-border/60 bg-gradient-card">
          <CardHeader><CardTitle className="font-display">{t("prices.chart_title", { crop })}</CardTitle></CardHeader>
          <CardContent style={{ height: 360 }}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--harvest)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--harvest)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="recorded_on" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="price_per_quintal" stroke="var(--harvest)" strokeWidth={2.5} fill="url(#priceFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PriceStat({ label, value, positive, showArrow }: { label: string; value: string; positive?: boolean; showArrow?: boolean }) {
  return (
    <Card className="border-border/60 bg-gradient-card">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 flex items-center gap-2 font-display text-2xl font-bold ${showArrow ? (positive ? "text-success" : "text-destructive") : "text-foreground"}`}>
          {showArrow && (positive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />)}
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
