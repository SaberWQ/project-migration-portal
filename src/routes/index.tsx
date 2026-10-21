import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "SmartGrow AI — Розумний догляд за рослинами" },
      { name: "description", content: "Мобільний інтерфейс SmartGrow AI для моніторингу вологості, температури та автоматичного поливу." },
      { property: "og:title", content: "SmartGrow AI — Розумний догляд за рослинами" },
      { property: "og:description", content: "Моніторинг вологості, температури та автоматичний полив рослин." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/dashboard" : "/auth", replace: true });
  },
});
