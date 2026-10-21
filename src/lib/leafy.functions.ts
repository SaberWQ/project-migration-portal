import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(20),
});

export const askLeafy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("plant_name, device_code, auto_mode")
      .eq("id", context.userId)
      .single();

    const plant = profile?.plant_name ?? "рослина";
    const sensors = profile?.device_code
      ? `Користувач має пристрій SmartGrow. Поточні показники: вологість ґрунту 42%, температура 22.5°C, вологість повітря 58%, pH 6.2. Автополив ${profile.auto_mode ? "увімкнено (поріг 30%)" : "вимкнено"}.`
      : "У користувача ще немає пристрою SmartGrow, тож реальних показників сенсорів немає — давай загальні поради та за доречності згадуй, що пристрій дасть точні дані.";

    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: `Ти Leafy — дружній помічник SmartGrow AI з догляду за кімнатними рослинами. Рослина користувача: ${plant}. ${sensors} Відповідай українською (або мовою користувача), коротко: 2–5 речень, практично й тепло. Не вигадуй показників, яких немає.`,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      const text = response.output
        .flatMap((item) => (item.type === "message" ? item.content : []))
        .map((c) => (c.type === "output_text" ? c.text : ""))
        .join("")
        .trim();
      return { reply: text || "Вибач, я не зміг сформулювати відповідь. Спробуй ще раз." };
    } catch (error) {
      if (error instanceof GatewayError) {
        console.error("Leafy gateway error", error.code, error.ids);
        return { reply: "Leafy зараз перевантажений. Спробуй, будь ласка, за хвилину." };
      }
      throw error;
    }
  });
