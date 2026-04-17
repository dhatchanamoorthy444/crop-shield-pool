import { useTranslation } from "react-i18next";
import { LANGS, type LangCode } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = (i18n.language as LangCode) || "en";

  const onChange = (val: string) => {
    void i18n.changeLanguage(val);
    if (typeof window !== "undefined") localStorage.setItem("cs_lang", val);
  };

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className={compact ? "w-[120px]" : "w-[150px]"}>
        <Globe className="h-4 w-4 mr-1 opacity-70" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
