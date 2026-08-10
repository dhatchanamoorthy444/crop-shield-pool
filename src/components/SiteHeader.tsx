import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Leaf, LayoutDashboard, Wallet, TrendingUp, BarChart3, MessageSquare, Search } from "lucide-react";
import { UserSearch } from "./messaging/UserSearch";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-4 px-6",
        isScrolled ? "py-3" : "py-6"
      )}
    >
      <div 
        className={cn(
          "mx-auto max-w-7xl flex items-center justify-between gap-6 px-6 h-16 rounded-full transition-all duration-500",
          isScrolled 
            ? "glass-dark border-white/10 shadow-2xl" 
            : "bg-transparent border-transparent"
        )}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft group-hover:scale-110 transition-all duration-500 border border-white/20">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </span>
          <span className="font-classic text-2xl font-bold tracking-widest text-foreground hidden sm:inline text-glow uppercase">
            AgriShield
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex px-2 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
          {user ? (
            <>
              <div className="px-2 border-r border-white/10">
                <UserSearch />
              </div>
              <NavLink to="/dashboard" icon={LayoutDashboard} label={t("nav.dashboard")} />
              <NavLink to="/pools" icon={Wallet} label={t("nav.pools")} />
              <NavLink to="/simulator" icon={TrendingUp} label={t("nav.simulator")} />
              <NavLink to="/prices" icon={BarChart3} label={t("nav.prices")} />
            </>
          ) : (
            <>
              <NavLink to="/" label="Solutions" />
              <NavLink to="/simulator" label="Risk Intelligence" />
              <NavLink to="/prices" label="Market Trends" />
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher compact />
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-muted-foreground hover:text-primary transition-colors"
                onClick={async () => {
                  await signOut();
                  void nav({ to: "/" });
                }}
              >
                {t("nav.signout")}
              </Button>
              <Button asChild size="sm" className="rounded-full px-6 font-bold shadow-premium bg-primary hover:bg-primary/90 text-white border border-white/10">
                <Link to="/dashboard">App</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex font-bold text-foreground/80 hover:text-white transition-colors">
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-6 font-bold shadow-premium bg-white text-black hover:bg-white/90 transition-all active:scale-95">
                <Link to="/auth">{t("nav.signup")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, icon: Icon, label }: { to: string; icon?: any; label: string }) {
  return (
    <Link 
      to={to} 
      className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-foreground/70 hover:text-white transition-all flex items-center gap-2 [&.active]:bg-primary/20 [&.active]:text-primary-foreground [&.active]:border border-transparent [&.active]:border-white/10"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}
