import { createFileRoute } from "@tanstack/react-router";
import { SmartGrowDashboard } from "@/components/smartgrow-dashboard";

export const Route = createFileRoute("/")({
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
  component: SmartGrowDashboard,
});
