import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Вхід і реєстрація — SmartGrow AI" },
      { name: "description", content: "Увійдіть або створіть акаунт SmartGrow AI, щоб доглядати за рослинами разом з Leafy." },
      { property: "og:title", content: "Вхід і реєстрація — SmartGrow AI" },
      { property: "og:description", content: "Створіть акаунт SmartGrow AI за хвилину." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z
  .string()
  .trim()
  .min(1, "Будь ласка, вкажіть вашу пошту")
  .email("Невірна адреса пошти")
  .max(255);

const passwordSchema = z
  .string()
  .min(1, "Будь ласка, вкажіть пароль")
  .min(8, "Пароль має містити щонайменше 8 символів")
  .max(72);

const nameSchema = z
  .string()
  .trim()
  .min(1, "Будь ласка, вкажіть ваше ім'я")
  .min(2, "Ім'я має містити щонайменше 2 символи")
  .max(60);

type Mode = "signup" | "signin" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Проверка на пустые поля перед отправкой
      if (mode === "signup" && !name.trim()) {
        toast.error("Будь ласка, вкажіть ваше ім'я");
        return;
      }
      if (!email.trim()) {
        toast.error("Будь ласка, вкажіть вашу пошту");
        return;
      }
      if (mode !== "forgot" && !password.trim()) {
        toast.error("Будь ласка, вкажіть пароль");
        return;
      }

      const mail = emailSchema.parse(email);
      setBusy(true);

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSentTo(mail);
        return;
      }

      const pass = passwordSchema.parse(password);

      if (mode === "signup") {
        const displayName = nameSchema.parse(name);
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password: pass,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: displayName },
          },
        });

        if (error) {
          if (error.message.includes("already registered") || error.message.includes("already exists")) {
            throw new Error("Користувач із такою поштою вже існує");
          }
          throw error;
        }

        if (!data.session) setSentTo(mail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
        if (error) {
          const errLower = error.message.toLowerCase();
          if (errLower.includes("invalid login credentials") || errLower.includes("invalid")) {
            throw new Error("Невірна пошта або пароль");
          } else if (errLower.includes("email not confirmed")) {
            throw new Error("Пошту не підтверджено. Перевірте вашу скриньку");
          } else {
            throw new Error(error.message);
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? err.issues[0]?.message
          : err instanceof Error
          ? err.message
          : "Щось пішло не так";
      toast.error(msg ?? "Щось пішло не так");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">SmartGrow</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">AI garden</p>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-border bg-card p-6 shadow-float sm:p-8">
          {sentTo ? (
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Перевірте пошту</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Ми надіслали лист на <span className="font-semibold text-foreground">{sentTo}</span>.{" "}
                {mode === "forgot" ? "Перейдіть за посиланням, щоб задати новий пароль." : "Підтвердіть адресу — і ви одразу потрапите в SmartGrow."}
              </p>
              <button onClick={() => { setSentTo(null); setMode("signin"); }} className="mt-6 text-sm font-semibold text-primary">
                Повернутися до входу
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">
                {mode === "signup" ? "Створіть акаунт" : mode === "signin" ? "З поверненням!" : "Відновлення пароля"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signup" ? "Leafy вже чекає, щоб познайомитися з вашою рослиною." : mode === "signin" ? "Увійдіть, щоб продовжити догляд." : "Вкажіть пошту — надішлемо посилання."}
              </p>

              <form onSubmit={submit} className="mt-6 grid gap-3">
                {mode === "signup" && <Field label="Ваше ім'я" value={name} onChange={setName} autoComplete="name" />}
                <Field label="Пошта" type="email" value={email} onChange={setEmail} autoComplete="email" />
                {mode !== "forgot" && (
                  <Field label="Пароль" type="password" value={password} onChange={setPassword} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                )}
                <button disabled={busy} className="mt-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
                  {busy ? "Зачекайте…" : mode === "signup" ? "Зареєструватися" : mode === "signin" ? "Увійти" : "Надіслати посилання"}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
                {mode === "signup" ? (
                  <button onClick={() => setMode("signin")} className="font-semibold text-primary">Вже маю акаунт</button>
                ) : (
                  <button onClick={() => setMode("signup")} className="font-semibold text-primary">Створити акаунт</button>
                )}
                {mode === "signin" && <button onClick={() => setMode("forgot")} className="text-muted-foreground">Забули пароль?</button>}
                {mode === "forgot" && <button onClick={() => setMode("signin")} className="text-muted-foreground">До входу</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input type={type} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring" />
    </label>
  );
}