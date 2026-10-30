import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, MessageSquare, Send, Check } from 'lucide-react'

export const Route = createFileRoute('/feedback')({
  component: FeedbackPage,
})

const feedbackTranslations = {
  'Українська': {
    back: 'Назад до огляду',
    title: 'Залишити відгук',
    subtitle: 'Поділіться своїми враженнями від використання SmartGrow AI',
    placeholder: 'Опишіть ваші враження, ідеї або знайдені баги...',
    send: 'Надіслати відгук',
    success: 'Дякуємо! Ваш відгук успішно надіслано.',
  },
  'English': {
    back: 'Back to overview',
    title: 'Leave Feedback',
    subtitle: 'Share your experience using SmartGrow AI',
    placeholder: 'Describe your feedback, ideas, or bugs found...',
    send: 'Submit feedback',
    success: 'Thank you! Your feedback has been sent.',
  },
  'Español': {
    back: 'Volver al resumen',
    title: 'Dejar comentarios',
    subtitle: 'Comparte tu experiencia usando SmartGrow AI',
    placeholder: 'Describe tus comentarios, ideas o errores encontrados...',
    send: 'Enviar comentarios',
    success: '¡Gracias! Tu comentario ha sido enviado.',
  },
  'Português': {
    back: 'Voltar à visão geral',
    title: 'Deixar feedback',
    subtitle: 'Compartilhe sua experiência usando SmartGrow AI',
    placeholder: 'Descreva seus comentários, ideias ou bugs encontrados...',
    send: 'Enviar feedback',
    success: 'Obrigado! Seu feedback foi enviado.',
  }
}

function FeedbackPage() {
  const [lang, setLang] = useState<keyof typeof feedbackTranslations>('Українська')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('smartgrow_language') as keyof typeof feedbackTranslations
    if (saved && feedbackTranslations[saved]) {
      setLang(saved)
    }
  }, [])

  const t = feedbackTranslations[lang] || feedbackTranslations['Українська']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSent(true)
    setText('')
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#17372d] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#39795d] hover:text-[#285d49] transition mb-8"
        >
          <ArrowLeft className="size-4" />
          {t.back}
        </Link>

        <div className="rounded-3xl border border-[#e3ebe3] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#2f7056] mb-2">
            <MessageSquare className="size-6" />
            <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-[#789084] mb-6">{t.subtitle}</p>

          {sent ? (
            <div className="rounded-2xl bg-[#e4f0df] p-6 text-center text-[#285d49]">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#39795d] text-white">
                <Check className="size-6" />
              </div>
              <p className="font-semibold">{t.success}</p>
              <button 
                onClick={() => setSent(false)} 
                className="mt-4 text-xs font-semibold underline cursor-pointer"
              >
                Надіслати ще один
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.placeholder}
                rows={5}
                className="w-full rounded-2xl border border-[#dfe8df] p-4 text-sm outline-none focus:border-[#2f7056] transition"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#2f7056] px-5 py-4 text-sm font-semibold text-white hover:bg-[#245b45] transition cursor-pointer"
              >
                <Send className="size-4" />
                {t.send}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}