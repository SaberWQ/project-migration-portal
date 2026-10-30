import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Star, MessageSquare, Send, Check, Sprout, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/feedback')({
  component: FeedbackPage,
})

const feedbackTranslations = {
  'Українська': {
    back: 'Назад до огляду',
    title: 'Залишити відгук',
    subtitle: 'Оцініть роботу SmartGrow AI та поділіться вашими враженнями',
    rateTitle: 'Ваша оцінка',
    categoryTitle: 'Категорія відгуку',
    catGeneral: 'Загальне',
    catInterface: 'Інтерфейс',
    catAi: 'Leafy AI',
    catBug: 'Помилка / Баг',
    placeholder: 'Опишіть ваші враження, ідеї або знайдені баги...',
    send: 'Надіслати відгук',
    sending: 'Надсилання...',
    successTitle: 'Дякуємо за ваш відгук!',
    successDesc: 'Ваша оцінка допомагає робити SmartGrow AI кращим.',
    sendAnother: 'Надіслати ще один',
    errorText: 'Не вдалося надіслати відгук. Спробуйте ще раз.'
  },
  'English': {
    back: 'Back to overview',
    title: 'Leave Feedback',
    subtitle: 'Rate SmartGrow AI and share your experience',
    rateTitle: 'Your Rating',
    categoryTitle: 'Feedback Category',
    catGeneral: 'General',
    catInterface: 'Interface',
    catAi: 'Leafy AI',
    catBug: 'Bug / Issue',
    placeholder: 'Describe your feedback, ideas, or bugs found...',
    send: 'Submit feedback',
    sending: 'Submitting...',
    successTitle: 'Thank you for your feedback!',
    successDesc: 'Your rating helps us improve SmartGrow AI.',
    sendAnother: 'Submit another',
    errorText: 'Failed to submit feedback. Please try again.'
  },
  'Español': {
    back: 'Volver al resumen',
    title: 'Dejar comentarios',
    subtitle: 'Califica SmartGrow AI y comparte tu experiencia',
    rateTitle: 'Tu valoración',
    categoryTitle: 'Categoría de comentarios',
    catGeneral: 'General',
    catInterface: 'Interfaz',
    catAi: 'Leafy AI',
    catBug: 'Error / Bug',
    placeholder: 'Describe tus comentarios, ideas o errores encontrados...',
    send: 'Enviar comentarios',
    sending: 'Enviando...',
    successTitle: '¡Gracias por tus comentarios!',
    successDesc: 'Tu valoración nos ayuda a mejorar SmartGrow AI.',
    sendAnother: 'Enviar otro',
    errorText: 'Error al enviar comentarios. Inténtalo de nuevo.'
  },
  'Português': {
    back: 'Voltar à visão geral',
    title: 'Deixar feedback',
    subtitle: 'Avalie o SmartGrow AI e compartilhe sua experiência',
    rateTitle: 'Sua avaliação',
    categoryTitle: 'Categoria do feedback',
    catGeneral: 'Geral',
    catInterface: 'Interface',
    catAi: 'Leafy AI',
    catBug: 'Erro / Bug',
    placeholder: 'Descreva seus comentários, ideias ou bugs encontrados...',
    send: 'Enviar feedback',
    sending: 'Enviando...',
    successTitle: 'Obrigado pelo seu feedback!',
    successDesc: 'Sua avaliação nos ajuda a melhorar o SmartGrow AI.',
    sendAnother: 'Enviar outro',
    errorText: 'Falha ao enviar feedback. Tente novamente.'
  }
}

function FeedbackPage() {
  const [lang, setLang] = useState<keyof typeof feedbackTranslations>('Українська')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [category, setCategory] = useState<string>('general')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('smartgrow_language') as keyof typeof feedbackTranslations
    if (saved && feedbackTranslations[saved]) {
      setLang(saved)
    }
  }, [])

  const t = feedbackTranslations[lang] || feedbackTranslations['Українська']

  const categories = [
    { id: 'general', label: t.catGeneral },
    { id: 'interface', label: t.catInterface },
    { id: 'ai', label: t.catAi },
    { id: 'bug', label: t.catBug },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user?.id || null,
            rating,
            category,
            message: text.trim(),
          }
        ])

      if (error) throw error

      setSent(true)
      setText('')
    } catch (err) {
      console.error('Error sending feedback to Supabase:', err)
      alert(t.errorText)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#17372d] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="grid size-9 place-items-center rounded-xl bg-[#2f7056] text-white">
              <Sprout className="size-5" />
            </div>
            <div>
              <p className="font-semibold tracking-[-0.03em] text-[#17372d]">SmartGrow</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#739084]">AI garden</p>
            </div>
          </Link>

          <Link 
            to="/" 
            className="inline-flex items-center gap-2 rounded-full border border-[#dfe8df] bg-white px-4 py-2 text-sm font-semibold text-[#39795d] hover:bg-gray-50 transition"
          >
            <ArrowLeft className="size-4" />
            {t.back}
          </Link>
        </div>

        <div className="rounded-3xl border border-[#e3ebe3] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#2f7056] mb-2">
            <MessageSquare className="size-6" />
            <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-[#789084] mb-8">{t.subtitle}</p>

          {sent ? (
            <div className="rounded-2xl bg-[#e4f0df] p-8 text-center text-[#285d49]">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[#39795d] text-white">
                <Check className="size-7" />
              </div>
              <h2 className="text-lg font-bold">{t.successTitle}</h2>
              <p className="mt-1 text-sm opacity-90">{t.successDesc}</p>
              <button 
                onClick={() => { setSent(false); setRating(5); }} 
                className="mt-6 rounded-xl bg-[#2f7056] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#245b45] transition cursor-pointer"
              >
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#17372d] mb-2">
                  {t.rateTitle}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || rating)
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star 
                          className={`size-8 transition-colors ${
                            active 
                              ? 'fill-[#f2b705] text-[#f2b705]' 
                              : 'fill-transparent text-[#d0dad2]'
                          }`} 
                        />
                      </button>
                    )
                  })}
                  <span className="ml-2 text-sm font-bold text-[#39795d]">
                    {hoverRating || rating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#17372d] mb-2">
                  {t.categoryTitle}
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#2f7056] text-white'
                          : 'bg-[#f1f5ed] text-[#4d7161] hover:bg-[#e4f0df]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.placeholder}
                  rows={5}
                  required
                  className="w-full rounded-2xl border border-[#dfe8df] p-4 text-sm outline-none focus:border-[#2f7056] transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#2f7056] px-5 py-4 text-sm font-semibold text-white hover:bg-[#245b45] transition disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t.sending}
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    {t.send}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
//.