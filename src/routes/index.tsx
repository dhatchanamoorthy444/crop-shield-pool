import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sprout, ShieldCheck, TrendingUp, Lock, Languages, FileText, ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero-field.jpg";
import { Farm3DScene } from "@/components/Farm3DScene";


export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "CropShield Pool — Village risk-pools for Indian farmers" },
      {
        name: "description",
        content:
          "Verified, encrypted, multi-language risk-sharing for smallholder farmers. Pool savings, automatic payouts, real-time mandi prices.",
      },
      { property: "og:title", content: "CropShield Pool" },
      { property: "og:description", content: "Village risk-pools that protect every farmer." },
    ],
  }),
});

function Landing() {
  const { t } = useTranslation();
  const features = [
    { icon: Sprout, title: t("landing.feature1_title"), body: t("landing.feature1_body") },
    { icon: TrendingUp, title: t("landing.feature2_title"), body: t("landing.feature2_body") },
    { icon: ShieldCheck, title: t("landing.feature3_title"), body: t("landing.feature3_body") },
    { icon: Lock, title: t("landing.feature4_title"), body: t("landing.feature4_body") },
    { icon: Languages, title: t("landing.feature5_title"), body: t("landing.feature5_body") },
    { icon: FileText, title: t("landing.feature6_title"), body: t("landing.feature6_body") },
  ];
  const steps = [t("landing.step1"), t("landing.step2"), t("landing.step3"), t("landing.step4")];

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Indian paddy fields at golden hour with farmers working together"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sprout className="h-3.5 w-3.5" /> {t("tagline")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] text-foreground text-balance sm:text-6xl">
              {t("landing.hero_title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("landing.hero_sub")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-elevated hover:bg-primary/90">
                <Link to="/auth">
                  {t("landing.cta_primary")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-foreground/20 bg-background/80 backdrop-blur">
                <Link to="/simulator">{t("landing.cta_secondary")}</Link>
              </Button>
            </div>
          </div>
          <Farm3DScene />
        </div>
      </section>


      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60 bg-gradient-card shadow-soft transition hover:shadow-elevated">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-extrabold sm:text-5xl">
            {t("landing.how_title")}
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className="rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-harvest font-display text-lg font-bold text-harvest-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 text-base leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold text-foreground sm:text-5xl text-balance">
          {t("landing.cta_band")}
        </h2>
        <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground shadow-elevated hover:bg-primary/90">
          <Link to="/auth">
            {t("landing.cta_primary")} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border/60 bg-background/80 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {t("brand")}. End-to-end encrypted. Built for farmers.
        </div>
      </footer>
    </div>
  );
}
