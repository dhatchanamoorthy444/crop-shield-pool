import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sprout, LayoutDashboard, Wallet, TrendingUp, Sprout as SproutIcon } from "lucide-react";
import { UserSearch } from "./messaging/UserSearch";

export function SiteHeader() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-soft">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="hidden sm:inline">{t("brand")}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <div className="mr-4">
                <UserSearch />
              </div>
              <Link to="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                {t("nav.dashboard")}
              </Link>
              <Link to="/pools" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                {t("nav.pools")}
              </Link>
              <Link to="/simulator" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                {t("nav.simulator")}
              </Link>
              <Link to="/prices" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5">
                <SproutIcon className="h-4 w-4" />
                {t("nav.prices")}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                void nav({ to: "/" });
              }}
            >
              {t("nav.signout")}
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">{t("nav.signup")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
