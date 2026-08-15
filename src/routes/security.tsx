import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, History, Bell, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { AgriShieldAI } from "@/components/ai/AgriShieldAI";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({ 
    title: "Security & Audit — AgriShield PRO",
    meta: [
      { name: "description", content: "Review your account's security alerts and login audit logs." }
    ]
  }),
});

function SecurityPage() {
  const { t } = useTranslation();
  const { ready, user } = useRequireAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const [{ data: logsData }, { data: alertsData }] = await Promise.all([
        supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("security_alerts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      setLogs(logsData || []);
      setAlerts(alertsData || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#050706] text-white">
      <SiteHeader />
      
      <main className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-classic text-5xl md:text-7xl font-extrabold tracking-widest mb-4 neon-text-green uppercase italic">
              Security <span className="text-primary font-signature lowercase text-7xl md:text-8xl tracking-normal">Vault</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Encryption & Audit Protocol</p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Security Alerts Section */}
          <section className="space-y-8">
            <h2 className="font-classic text-3xl font-bold flex items-center gap-4 uppercase tracking-widest">
              <Bell className="h-8 w-8 text-amber-500" /> Critical Alerts
            </h2>
            <div className="glass-dark p-6 rounded-[2.5rem] border-white/5 space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No active security threats detected</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
                    <AlertTriangle className={`h-5 w-5 mt-1 ${
                      alert.severity === 'critical' ? 'text-red-500' : 
                      alert.severity === 'high' ? 'text-orange-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold uppercase tracking-widest text-[10px]">{alert.alert_type}</span>
                        <Badge variant="outline" className="text-[8px] border-white/10 uppercase tracking-tighter">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">{alert.message}</p>
                      <span className="text-[10px] text-muted-foreground font-bold">
                        {format(new Date(alert.created_at), "MMM d, yyyy • HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Audit Logs Section */}
          <section className="space-y-8">
            <h2 className="font-classic text-3xl font-bold flex items-center gap-4 uppercase tracking-widest">
              <History className="h-8 w-8 text-primary" /> Access History
            </h2>
            <div className="glass-dark p-6 rounded-[2.5rem] border-white/5 overflow-hidden">
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 ${
                        log.status === 'success' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {log.status === 'success' ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase tracking-widest">
                          {log.event_type.replace('_', ' ')}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          {format(new Date(log.created_at), "MMM d, yyyy • HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/5 text-muted-foreground text-[10px] border-white/5">
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <AgriShieldAI />
    </div>
  );
}
