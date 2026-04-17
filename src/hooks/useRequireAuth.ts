import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

/** Redirects unauthenticated visitors to /auth. Returns auth state once ready. */
export function useRequireAuth() {
  const auth = useAuth();
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) void nav({ to: "/auth" });
    else setReady(true);
  }, [auth.loading, auth.user, nav]);
  return { ...auth, ready };
}
