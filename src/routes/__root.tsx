import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import "@/i18n";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AgriShield — Intelligent Agricultural Risk Management" },
      {
        name: "description",
        content:
          "AgriShield helps farmers and agricultural stakeholders understand risk, access intelligent insights, and make more informed decisions.",
      },
      { name: "author", content: "AgriShield" },
      { property: "og:title", content: "AgriShield" },
      { property: "og:description", content: "Intelligent Agricultural Risk Management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="relative min-h-screen selection:bg-primary selection:text-white">
          {/* Atmospheric Background System */}
          <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050706]">
            {/* Layer 2: Main blurred green gradient */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] animate-pulse-gentle" />
            
            {/* Layer 3: Subtle warm gold/olive glow */}
            <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[100px] animate-drift" />
            
            {/* Layer 4: Grain texture */}
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />
            
            {/* Layer 5: Dynamic atmospheric gradients */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-float" />
              <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[130px] animate-float" style={{ animationDelay: '-2s' }} />
            </div>
          </div>

          <Outlet />
          <Toaster richColors position="top-center" />
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}
