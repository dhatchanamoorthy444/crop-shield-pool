import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, ShieldCheck, TrendingUp, Droplets, Leaf, Activity, CheckCircle2 } from "lucide-react";
import { AgriShieldAI } from "@/components/ai/AgriShieldAI";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">
              <Leaf className="h-4 w-4" />
              <span>Next-Generation Risk Management</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl mb-8">
              Smarter Risk Decisions for a More <span className="text-primary italic">Resilient Farm.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Understand agricultural risks, monitor changing conditions, and make better decisions with intelligent tools built for modern agriculture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-14 px-10 text-lg font-semibold rounded-full shadow-premium transition-transform hover:scale-105 active:scale-95">
                <Link to="/auth">Explore Risk Intelligence</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold rounded-full bg-background/50 backdrop-blur-md transition-transform hover:scale-105 active:scale-95">
                <Link to="/simulator">Ask AgriShield AI</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=farmer${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <span>Trusted by 500+ agricultural groups</span>
            </div>
          </div>
          <div className="relative lg:block hidden">
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl rounded-full opacity-60 animate-pulse" />
            <div className="relative space-y-4">
              <Card className="p-6 bg-white/80 backdrop-blur-xl border border-white/50 shadow-premium transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-display font-bold flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Overall Risk Score</h4>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">MODERATE</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '72%' }} />
                </div>
                <div className="mt-2 flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Safe</span>
                  <span>Critical</span>
                </div>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-premium transform hover:-translate-y-1 transition-all duration-300 delay-75">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Weather Risk</p>
                  <p className="text-2xl font-bold">Low</p>
                </Card>
                <Card className="p-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-premium transform hover:-translate-y-1 transition-all duration-300 delay-150">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Market Risk</p>
                  <p className="text-2xl font-bold text-primary">High</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-y border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap justify-between items-center gap-8 md:gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
            {[
              { icon: ShieldCheck, label: "Risk Intelligence" },
              { icon: Brain, label: "AI Assistance" },
              { icon: Activity, label: "Weather Awareness" },
              { icon: Leaf, label: "Crop Insights" },
              { icon: TrendingUp, label: "Decision Support" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                <item.icon className="h-6 w-6 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Agricultural Risk Is Changing Faster Than Ever.</h2>
            <p className="text-xl text-muted-foreground">Farmers face multiple interconnected risks that require more than just experience—they require data and intelligence.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Unpredictable Weather", desc: "Monitor changing patterns and receive localized risk alerts before they affect your harvest.", icon: Activity },
              { title: "Crop Health", desc: "Early detection of pests and disease risks to protect your investments and yield.", icon: Leaf },
              { title: "Water Scarcity", desc: "Intelligent water management and risk analysis based on local hydrological data.", icon: Droplets },
              { title: "Market Volatility", desc: "Understand price trends and market dynamics to time your sales for maximum value.", icon: TrendingUp },
              { title: "Operational Uncertainty", desc: "Mitigate risks associated with labor, inputs, and logistics during critical windows.", icon: Brain },
              { title: "Financial Exposure", desc: "Identify and manage financial risks before they lead to excessive debt or loss.", icon: ShieldCheck },
            ].map((p, i) => (
              <Card key={i} className="group p-8 border-none shadow-soft hover:shadow-premium transition-all duration-300 rounded-3xl">
                <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <p.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-32 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Solutions Built for Agricultural Resilience.</h2>
            <p className="text-xl text-muted-foreground">Comprehensive tools designed to give you a complete picture of your farm's risk landscape.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="overflow-hidden rounded-3xl border-none shadow-premium flex flex-col md:flex-row">
              <div className="flex-1 p-10 flex flex-col justify-center">
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Core Platform</span>
                <h3 className="text-3xl font-bold mb-4">Risk Management Dashboard</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  A centralized view of all your agricultural indicators. Track risk scores, monitor trends, and receive actionable insights in real-time.
                </p>
                <Button variant="link" className="p-0 text-primary font-bold flex items-center gap-2 group">
                  Explore Features <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="md:w-72 bg-muted relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop" 
                  alt="Dashboard Preview" 
                  className="h-full w-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              </div>
            </Card>
            <Card className="overflow-hidden rounded-3xl border-none shadow-premium flex flex-col md:flex-row">
              <div className="flex-1 p-10 flex flex-col justify-center">
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4">AI Intelligence</span>
                <h3 className="text-3xl font-bold mb-4">AI Agricultural Assistant</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Your personalized agricultural expert. Ask questions about crops, pests, weather, and management to get data-driven guidance.
                </p>
                <Button variant="link" className="p-0 text-primary font-bold flex items-center gap-2 group">
                  Meet your assistant <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="md:w-72 bg-muted relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop" 
                  alt="AI Preview" 
                  className="h-full w-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">From Risk to Action.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-12 relative">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-muted hidden md:block" />
            {[
              { num: "01", title: "Assess", desc: "Identify your specific agricultural risk profile and assets." },
              { num: "02", title: "Analyze", desc: "Understand the severity and potential impact of threats." },
              { num: "03", title: "Act", desc: "Use intelligent recommendations to implement protection." },
              { num: "04", title: "Protect", desc: "Build long-term resilience for your farm and community." },
            ].map((step, i) => (
              <div key={i} className="relative z-10 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground font-display font-extrabold text-2xl flex items-center justify-center mb-8 border-4 border-background shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[4rem] bg-primary text-primary-foreground p-12 md:p-24 relative overflow-hidden text-center shadow-premium">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-8">Build a More Resilient Agricultural Future.</h2>
            <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Understand risk. Make informed decisions. Protect what matters most. Join AgriShield today.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button asChild size="lg" className="h-16 px-12 text-xl font-bold rounded-full bg-white text-primary hover:bg-white/90">
                <Link to="/auth">Get Started Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-full border-white/30 text-white hover:bg-white/10">
                <Link to="/simulator">Talk to AI Assistant</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-muted/30 pt-24 pb-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </span>
                AgriShield
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-xs mb-8">
                AgriShield helps farmers and agricultural stakeholders understand risk, access intelligent insights, and make more informed decisions.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Product</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/dashboard" className="hover:text-primary">Risk Dashboard</Link></li>
                <li><Link to="/simulator" className="hover:text-primary">AI Assistant</Link></li>
                <li><Link to="/prices" className="hover:text-primary">Market Prices</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Sustainability</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-muted-foreground">Support</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AgriShield. All rights reserved.</p>
            <div className="flex gap-8">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> End-to-end Encrypted</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> ISO Certified</span>
            </div>
          </div>
        </div>
      </footer>

      <AgriShieldAI />
    </div>
  );
}
