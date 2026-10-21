import { createFileRoute } from "@tanstack/react-router";
import { SmartGrowDashboard } from "@/components/smartgrow-dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Мій сад — SmartGrow AI" },
      { name: "description", content: "Стан рослини, полив і поради Leafy в SmartGrow AI." },
      { property: "og:title", content: "Мій сад — SmartGrow AI" },
      { property: "og:description", content: "Стан рослини, полив і поради Leafy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SmartGrowDashboard,
});
