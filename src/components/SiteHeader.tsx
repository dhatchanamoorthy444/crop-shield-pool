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
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-border shadow-soft h-16" 
          : "bg-transparent h-20"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft group-hover:scale-105 transition-transform">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-foreground hidden sm:inline">
            AgriShield
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex bg-muted/30 p-1 rounded-full border border-border/50">
          {user ? (
            <>
              <div className="px-2 border-r border-border/50">
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-muted-foreground hover:text-primary"
                onClick={async () => {
                  await signOut();
                  void nav({ to: "/" });
                }}
              >
                {t("nav.signout")}
              </Button>
              <Button asChild size="sm" className="rounded-full px-5 font-bold shadow-soft">
                <Link to="/dashboard">Go to App</Link>
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex font-bold">
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-6 font-bold shadow-premium">
                <Link to="/auth">{t("nav.signup")}</Link>
              </Button>
            </>
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
      className="px-4 py-1.5 rounded-full text-sm font-bold text-muted-foreground hover:text-primary hover:bg-white transition-all flex items-center gap-2 [&.active]:bg-white [&.active]:text-primary [&.active]:shadow-sm"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </Link>
  );
}
