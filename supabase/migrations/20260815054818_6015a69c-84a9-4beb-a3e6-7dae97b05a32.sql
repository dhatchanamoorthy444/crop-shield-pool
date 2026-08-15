-- =====================
-- LOGIN AUDIT LOGS
-- =====================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for fast lookups
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);

-- =====================
-- SECURITY ALERTS
-- =====================
CREATE TABLE public.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

GRANT SELECT ON public.security_alerts TO authenticated;
GRANT ALL ON public.security_alerts TO service_role;

-- Policies
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own security alerts"
ON public.security_alerts FOR SELECT TO authenticated
USING (user_id = auth.uid());
