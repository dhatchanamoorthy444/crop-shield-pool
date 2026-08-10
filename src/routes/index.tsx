import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, ShieldCheck, TrendingUp, Droplets, Leaf, Activity } from "lucide-react";
import { AgriShieldAI } from "@/components/ai/AgriShieldAI";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <Leaf className="h-4 w-4" />
              <span>Next-Gen AgriTech</span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.1] text-foreground tracking-tight sm:text-7xl">
              Smarter Risk Decisions for a More Resilient Farm.
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Understand agricultural risks, monitor changing conditions, and make better decisions with intelligent tools built for modern agriculture.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link to="/auth">Explore Risk Intelligence</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <Link to="/simulator">Ask AgriShield AI</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
            <Card className="relative p-6 bg-white/60 backdrop-blur-xl border border-white/50 shadow-premium">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">Overall Risk</p>
                  <p className="text-2xl font-bold">Moderate</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Droplets className="h-6 w-6 text-primary" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">Water Risk</p>
                  <p className="text-2xl font-bold">Low</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-y border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { icon: ShieldCheck, label: "Risk Intelligence" },
            { icon: Brain, label: "AI Assistance" },
            { icon: Activity, label: "Weather Awareness" },
            { icon: Leaf, label: "Crop Insights" },
            { icon: TrendingUp, label: "Decision Support" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center text-sm font-medium text-muted-foreground">
              <item.icon className="h-6 w-6 text-primary" />
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl font-bold">Agricultural Risk Is Changing Faster Than Ever.</h2>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Unpredictable Weather" },
              { icon: Droplets, title: "Water Scarcity" },
              { icon: ShieldCheck, title: "Market Volatility" },
            ].map((p, i) => (
              <Card key={i} className="p-8 shadow-premium border-none">
                <p.icon className="h-10 w-10 text-primary mx-auto" />
                <h3 className="mt-6 font-bold text-xl">{p.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <AgriShieldAI />
    </div>
  );
}
