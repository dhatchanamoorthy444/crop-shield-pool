import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, ShieldCheck, TrendingUp, Droplets, Leaf, Activity, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { AgriShieldAI } from "@/components/ai/AgriShieldAI";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroImageY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);

  return (
    <div className="min-h-screen bg-[#050706] text-white selection:bg-primary selection:text-white" ref={containerRef}>
      <SiteHeader />

      {/* HERO SECTION — CINEMATIC EXPERIENCE */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Background cinematic imagery */}
        <motion.div 
          style={{ y: heroImageY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2400&auto=format&fit=crop" 
            alt="Cinematic Field"
            className="w-full h-full object-cover scale-110 blur-[2px]"
          />
          {/* Green Cinematic Tint Overlay */}
          <div className="absolute inset-0 bg-[#050706]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-transparent to-[#050706]/30" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8 backdrop-blur-md">
              <Leaf className="h-4 w-4" />
              <span>Next-Gen Agricultural Intelligence</span>
            </div>
            <h1 className="font-classic text-6xl md:text-[5.5rem] font-extrabold tracking-tighter mb-8 leading-[0.9] text-glow neon-text-green uppercase">
              See Risk.<br />
              <span className="text-primary italic font-signature lowercase normal-case text-7xl md:text-[6.5rem]">Think Smarter.</span><br />
              Grow Stronger.
            </h1>
            <p className="font-friendly text-xl text-muted-foreground mb-12 max-w-xl leading-relaxed">
              AgriShield brings agricultural risk intelligence, AI assistance, and data-driven insights together in one powerful platform.
            </p>
            <div className="flex flex-wrap gap-6">
              <Button asChild size="lg" className="rounded-full px-10 h-16 bg-primary text-black font-bold hover:bg-primary/90 shadow-[0_0_30px_rgba(0,255,102,0.3)] transition-all duration-300 active:scale-95 group border-none">
                <Link to="/auth" className="flex items-center gap-2">
                  Explore Risk Intelligence
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full px-10 h-16 border border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all duration-300">
                <Link to="/simulator">Ask AgriShield AI</Link>
              </Button>
            </div>
          </motion.div>

          {/* Floating Glass Cards System - Optimized to prevent overlap */}
          <div className="relative h-[700px] hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.5, 
                duration: 1.5,
                type: "spring",
                stiffness: 50
              }}
              className="absolute top-0 left-0 glass-dark p-8 rounded-[2rem] w-80 border-white/10 shadow-2xl z-20 animate-float"
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Risk Score</p>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-6xl font-classic font-extrabold text-white mb-2 italic">72</p>
              <p className="text-xs text-primary font-bold uppercase tracking-widest">Moderate Status</p>
              <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ delay: 1.5, duration: 2 }}
                  className="h-full bg-primary neon-glow-green"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="absolute top-[35%] right-0 glass-dark p-6 rounded-2xl w-72 border-white/5 shadow-2xl z-10 animate-bounce-slow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-accent" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">AI Analysis</p>
              </div>
              <p className="text-sm font-friendly leading-relaxed text-muted-foreground italic">
                "Suboptimal moisture in Sector B-4. Priority irrigation recommended."
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="absolute bottom-10 left-20 glass p-5 rounded-2xl w-60 border-white/5 shadow-2xl z-30 neon-glow-green"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Trend</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-classic font-bold text-white">+12.4%</p>
                <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-wider">Incr</p>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Cinematic Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-12 bg-gradient-to-t from-primary to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Scroll to explore</span>
        </motion.div>
      </section>

      {/* INTELLIGENCE SECTION — SOLUTIONS SHOWCASE */}
      <section className="py-32 bg-[#080B09]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="font-luxury text-4xl md:text-7xl font-extrabold mb-8 max-w-3xl italic">Intelligence Built Around the Farm.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              AgriShield provides the financial and intelligence infrastructure for resilient agricultural operations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SolutionCard 
              title="Risk Dashboard" 
              icon={LayoutDashboard} 
              desc="A centralized view of all agricultural indicators. Monitor risk scores in real-time."
              delay={0.1}
            />
            <SolutionCard 
              title="AI Assistant" 
              icon={Brain} 
              desc="Personalized expert guidance. Ask about pests, weather, or crop management."
              delay={0.2}
            />
            <SolutionCard 
              title="Weather Intelligence" 
              icon={Activity} 
              desc="Localized hyper-accurate forecasts and historical climate pattern analysis."
              delay={0.3}
            />
            <SolutionCard 
              title="Crop Monitoring" 
              icon={Leaf} 
              desc="Satellite-based health tracking and early disease detection triggers."
              delay={0.4}
            />
            <SolutionCard 
              title="Decision Support" 
              icon={TrendingUp} 
              desc="Data-driven insights to help you sell at peak prices and manage inputs efficiently."
              delay={0.5}
            />
            <SolutionCard 
              title="Secure Sovereignty" 
              icon={ShieldCheck} 
              desc="End-to-end encryption for your farm data. You control all permissions."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — EDITORIAL GRID */}
      <section className="py-32 bg-[#050706] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden group shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1600&auto=format&fit=crop" 
                alt="Modern Farm Intelligence"
                className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10 right-10 p-8 glass-dark rounded-3xl border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Platform Preview</p>
                <h3 className="text-2xl font-bold">Real-time Risk Visualization</h3>
              </div>
            </motion.div>

            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-impact text-4xl md:text-7xl font-extrabold mb-12 tracking-wide uppercase"
              >
                From Risk to Action.<br />
                A Polished Workflow.
              </motion.h2>
              <div className="space-y-10">
                <Step number="01" title="Secure Identity" desc="Verify your identity with end-to-end encrypted document verification." />
                <Step number="02" title="Form Cooperatives" desc="Connect with your community using secure 6-letter village pool codes." />
                <Step number="03" title="Intelligent Analysis" desc="Monitor climate, soil, and market triggers via the AgriShield dashboard." />
                <Step number="04" title="Automated Protection" desc="Build financial resilience with automated risk-pool payouts." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-[4rem] bg-primary p-12 md:p-24 relative overflow-hidden text-center shadow-2xl group"
        >
          {/* Animated Light Sweep */}
          <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
          
          <div className="relative z-10">
            <h2 className="font-classic text-4xl md:text-6xl font-extrabold mb-8 leading-tight uppercase">
              Ready to grow a more<br />resilient future?
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-medium">
              Join the thousand of farmers already using AgriShield to manage risk intelligently.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild size="lg" className="rounded-full px-12 h-16 text-xl font-bold bg-white text-black hover:bg-white/90 shadow-xl transition-all hover:scale-105 active:scale-95">
                <Link to="/auth">Get Started Now</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full px-12 h-16 text-xl font-bold border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                <Link to="/simulator">View Simulation</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-[#050706] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div>
              <Link to="/" className="flex items-center gap-3 font-display text-3xl font-extrabold text-glow mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Leaf className="h-6 w-6 text-white" />
                </span>
                AgriShield
              </Link>
              <p className="text-muted-foreground text-sm tracking-widest uppercase font-bold">
                Built for a more resilient agricultural future.
              </p>
            </div>
            
            <div className="flex gap-12 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Link to="/dashboard" className="hover:text-primary transition-colors">Platform</Link>
              <Link to="/simulator" className="hover:text-primary transition-colors">Risk Intelligence</Link>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            © 2026 AgriShield Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
      
      <AgriShieldAI />
    </div>
  );
}

function SolutionCard({ title, icon: Icon, desc, delay }: { title: string; icon: any; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -10, borderColor: "rgba(27, 77, 46, 0.4)" }}
      className="glass-dark p-10 rounded-[2.5rem] border border-white/5 transition-all duration-500 group cursor-default"
    >
      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-8 border border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-classic text-2xl font-bold mb-4 uppercase tracking-wider">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-8 group cursor-default"
    >
      <div className="flex-shrink-0 font-display text-4xl font-extrabold text-white/10 group-hover:text-primary/40 transition-colors duration-500">
        {number}
      </div>
      <div>
        <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
      </div>
    </motion.div>
  );
}
