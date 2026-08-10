import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, ShieldCheck, TrendingUp, Droplets, Leaf, Activity } from "lucide-react";
import { AgriShieldAI } from "@/components/ai/AgriShieldAI";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    title: "AgriShield — Legendary Risk Intelligence",
    meta: [
      { name: "description", content: "AgriShield brings agricultural risk intelligence, AI assistance, and data-driven insights together." },
    ],
  }),
});

function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#050706] text-white">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background cinematic imagery */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2400&auto=format&fit=crop" 
            alt="Cinematic Field"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-[#050706]/70 to-[#050706]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[0.95]">
              See Risk.<br />
              <span className="text-primary/90 italic">Think Smarter.</span><br />
              Grow Stronger.
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-xl leading-relaxed">
              AgriShield brings agricultural risk intelligence, AI assistance, and data-driven insights together in one powerful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 h-14 bg-primary text-white hover:bg-primary/90 shadow-premium">
                <Link to="/auth">Explore Risk Intelligence</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full px-8 h-14 border border-white/10 hover:bg-white/10">
                <Link to="/simulator">Ask AgriShield AI</Link>
              </Button>
            </div>
          </motion.div>

          {/* Floating Glass Cards */}
          <div className="relative h-[500px] hidden lg:block">
            <motion.div 
              className="absolute top-10 -left-10 glass-dark p-6 rounded-3xl w-72"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Overall Risk</p>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <p className="text-4xl font-extrabold text-white">72 <span className="text-lg text-muted-foreground">/ 100</span></p>
              <p className="text-sm text-primary font-bold">Moderate Risk</p>
            </motion.div>

            <motion.div 
              className="absolute bottom-10 right-0 glass-dark p-6 rounded-3xl w-64"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Insight</p>
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground italic">"Rainfall patterns suggest increased irrigation needs for paddy crops."</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-32 bg-[#080B09]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-6">Intelligence Built Around the Farm.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Comprehensive tools designed to give you a complete picture of your farm's risk landscape.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SolutionCard title="Risk Dashboard" icon={LayoutDashboard} />
            <SolutionCard title="AI Assistant" icon={Brain} />
            <SolutionCard title="Weather Awareness" icon={Activity} />
            <SolutionCard title="Crop Insights" icon={Leaf} />
            <SolutionCard title="Decision Support" icon={TrendingUp} />
            <SolutionCard title="Data Sovereignty" icon={ShieldCheck} />
          </div>
        </div>
      </section>
      
      <AgriShieldAI />
    </div>
  );
}

function SolutionCard({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="glass-dark p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-colors"
    >
      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-8 border border-white/10">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground">Sophisticated data intelligence tailored for modern agricultural operations.</p>
    </motion.div>
  );
}

function LayoutDashboard(_props: any) { return <LayoutDashboard className="h-6 w-6" />; }
