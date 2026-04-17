import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/SiteHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { processKycDocument } from "@/server/kyc.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/kyc")({
  component: KycPage,
  head: () => ({ meta: [{ title: "Verify ID — CropShield" }] }),
});

type DocType = "aadhaar" | "voter_id" | "pan" | "driving_license";

function KycPage() {
  const { t } = useTranslation();
  const { ready, user, refreshProfile } = useRequireAuth();
  const processFn = useServerFn(processKycDocument);
  const [docType, setDocType] = useState<DocType>("aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<Array<{ id: string; doc_type: string; status: string; extracted_name: string | null; masked_id_number: string | null; created_at: string }>>([]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDocs((data ?? []) as never);
  };

  useEffect(() => { if (ready) void refresh(); }, [ready]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user) { toast.error("Please choose a file"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("File must be under 8MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image (JPG/PNG)"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${docType}.${ext}`;
      const { error: upErr } = await supabase.storage.from("kyc-documents").upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: row, error: insErr } = await supabase.from("kyc_documents").insert({
        user_id: user.id, doc_type: docType, storage_path: path, status: "pending",
      }).select().single();
      if (insErr || !row) throw insErr ?? new Error("Insert failed");

      toast.message(t("kyc.processing"));
      const result = await processFn({ data: { documentId: row.id } });
      if (!result.ok) toast.error(result.error ?? "OCR failed — saved for manual review");
      else toast.success(t("common.success"));

      setFile(null);
      await refresh();
      await refreshProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-field">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{t("kyc.title")}</h1>
        <p className="mt-2 flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" /> {t("kyc.subtitle")}
        </p>

        <Card className="mt-6 border-border/60 bg-gradient-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> {t("kyc.upload")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("kyc.doc_type")}</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">{t("kyc.aadhaar")}</SelectItem>
                    <SelectItem value="voter_id">{t("kyc.voter_id")}</SelectItem>
                    <SelectItem value="pan">{t("kyc.pan")}</SelectItem>
                    <SelectItem value="driving_license">{t("kyc.driving_license")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">{t("kyc.upload")}</Label>
                <Input id="file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <Button type="submit" disabled={busy || !file} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {busy ? t("kyc.processing") : t("kyc.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {docs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-foreground">Submitted documents</h2>
            <ul className="mt-3 space-y-2">
              {docs.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-4">
                  <div>
                    <p className="font-semibold text-foreground capitalize">{d.doc_type.replace("_", " ")}</p>
                    {d.extracted_name && <p className="text-xs text-muted-foreground">{t("kyc.extracted_name")}: {d.extracted_name}</p>}
                    {d.masked_id_number && <p className="text-xs text-muted-foreground">{t("kyc.masked_id")}: {d.masked_id_number}</p>}
                  </div>
                  <Badge variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "outline"} className={d.status === "approved" ? "bg-success text-success-foreground" : ""}>
                    {d.status === "approved" ? t("kyc.status_approved") : d.status === "rejected" ? t("kyc.status_rejected") : t("kyc.status_pending")}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
