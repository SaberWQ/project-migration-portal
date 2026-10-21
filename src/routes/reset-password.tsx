import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Новий пароль — SmartGrow AI" },
      { name: "description", content: "Задайте новий пароль для акаунта SmartGrow AI." },
      { property: "og:title", content: "Новий пароль — SmartGrow AI" },
      { property: "og:description", content: "Відновлення доступу до SmartGrow AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Пароль має містити щонайменше 8 символів");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error("Посилання застаріло. Запросіть нове на сторінці входу.");
    toast.success("Пароль оновлено");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] border border-border bg-card p-8 shadow-float">
        <h1 className="text-2xl font-semibold tracking-tight">Новий пароль</h1>
        <p className="mt-2 text-sm text-muted-foreground">Придумайте пароль щонайменше з 8 символів.</p>
        <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Новий пароль" className="mt-6 w-full rounded-xl border border-input px-4 py-3 text-sm outline-none focus:border-ring" />
        <button disabled={busy} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Зберігаємо…" : "Зберегти пароль"}
        </button>
      </form>
    </main>
  );
}
