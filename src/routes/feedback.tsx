import { createFileRoute } from '@tanstack/react-router'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { Check, MessageCircle, Send, Star, ThumbsUp } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client' // Используем клиент из вашего проекта

export const Route = createFileRoute('/feedback')({
  component: FeedbackPage,
})

const categories = ['Зручність', 'Функції', 'Дизайн', 'Інше'] as const
const sentiments = ['Дуже задоволений', 'Задоволений', 'Нейтрально', 'Незадоволений'] as const

function FeedbackPage() {
  const [user, setUser] = useState<User | null>(null)
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState<(typeof categories)[number]>('Зручність')
  const [sentiment, setSentiment] = useState<(typeof sentiments)[number]>('Дуже задоволений')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const ratingLabel = useMemo(() => ['Оберіть оцінку', 'Дуже погано', 'Погано', 'Нормально', 'Добре', 'Чудово'][rating], [rating])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rating || comment.trim().length < 3) {
      setStatus('Оберіть оцінку та додайте коментар від 3 символів.')
      return
    }
    if (!user) {
      setStatus('Щоб зберегти відгук, увійдіть до свого акаунта.')
      return
    }
    
    setSaving(true)
    setStatus('')
    const { error } = await supabase
      .from('feedback_entries')
      .insert({ user_id: user.id, rating, category, sentiment, comment: comment.trim() })
    
    setSaving(false)
    if (error) {
      console.error(error)
      setStatus('Не вдалося зберегти відгук. Спробуйте ще раз.')
      return
    }
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] px-5 py-8 text-[#18322c] md:px-10 md:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between rounded-[28px] border border-[#dce8e2] bg-white/80 px-6 py-5 shadow-sm backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[#c8e86a] font-bold text-[#234d31]">S</div>
            <span className="text-lg font-semibold tracking-tight">SmartGrow</span>
          </div>
          <span className="rounded-full bg-[#eef5ef] px-4 py-2 text-sm font-medium text-[#557267]">Ваш голос важливий</span>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col justify-between rounded-[32px] bg-[#21483e] p-8 text-white shadow-xl shadow-[#21483e]/10 md:p-12">
            <div>
              <div className="mb-8 grid size-14 place-items-center rounded-2xl bg-[#c8e86a] text-[#21483e]">
                <MessageCircle />
              </div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#b9d8c8]">Зворотний зв&apos;язок</p>
              <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight md:text-6xl">Допоможіть нам стати кращими</h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-[#d5e8de]">Поділіться враженнями від SmartGrow. Це займе менше хвилини, а ваша думка допоможе нам розвивати сервіс.</p>
            </div>
            <div className="mt-16 flex items-center gap-3 text-sm text-[#c8e1d4]">
              <ThumbsUp className="size-5" /> <span>Ваш відгук бачить команда продукту</span>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#dce8e2] bg-white p-7 shadow-sm md:p-10">
            {submitted ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                <div className="mb-6 grid size-20 place-items-center rounded-full bg-[#e9f7d1] text-[#4f7d28]">
                  <Check className="size-10" />
                </div>
                <h2 className="text-3xl font-semibold">Дякуємо за відгук</h2>
                <p className="mt-3 max-w-sm text-[#6b8178]">Ми вже передали вашу реакцію команді. Кожен коментар допомагає нам рухатися вперед.</p>
                <button onClick={() => { setSubmitted(false); setRating(0); setComment('') }} className="mt-8 rounded-full bg-[#21483e] px-6 py-3 font-semibold text-white transition hover:bg-[#173a31]">
                  Залишити ще один
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Як вам наш сервіс?</h2>
                  <p className="mt-2 text-sm text-[#71847c]">Оцініть досвід від 1 до 5 зірок</p>
                  <div className="mt-5 flex gap-2" role="radiogroup" aria-label="Оцінка сервісу">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} з 5`} aria-pressed={rating === value} className={`grid size-12 place-items-center rounded-2xl border transition ${rating >= value ? 'border-[#c8e86a] bg-[#e9f7d1] text-[#4f7d28]' : 'border-[#dce8e2] text-[#b8c6bf] hover:border-[#a9c9b5]'}`}>
                        <Star className="size-6" fill={rating >= value ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#557267]">{ratingLabel}</p>
                </div>

                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">Що саме оцінюєте?</legend>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((item) => (
                      <button type="button" key={item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-sm transition ${category === item ? 'border-[#21483e] bg-[#21483e] text-white' : 'border-[#dce8e2] text-[#557267] hover:border-[#9dbbac]'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">Ваш настрій</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {sentiments.map((item) => (
                      <button type="button" key={item} onClick={() => setSentiment(item)} className={`rounded-xl border px-3 py-3 text-xs transition ${sentiment === item ? 'border-[#b4d85d] bg-[#f0f8de] font-semibold text-[#426a2e]' : 'border-[#dce8e2] text-[#71847c] hover:border-[#9dbbac]'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="comment" className="mb-3 block text-sm font-semibold">Розкажіть детальніше</label>
                  <textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={5} placeholder="Що сподобалось або що можна покращити?" className="w-full resize-none rounded-2xl border border-[#dce8e2] bg-[#fbfdfb] px-4 py-3 text-sm outline-none transition placeholder:text-[#a9b8b1] focus:border-[#7da88e] focus:ring-4 focus:ring-[#dff0e3]" />
                  <div className="mt-2 flex justify-between text-xs text-[#8da097]">
                    <span>Будь-які деталі допоможуть</span>
                    <span>{comment.length}/1000</span>
                  </div>
                </div>

                {status && <p role="alert" className="rounded-xl bg-[#fff5e8] px-4 py-3 text-sm text-[#936a36]">{status}</p>}

                <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-full bg-[#c8e86a] px-6 py-4 font-semibold text-[#21483e] transition hover:bg-[#b9dc5c] disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Надсилаємо…' : 'Надіслати відгук'} {!saving && <Send className="size-4" />}
                </button>

                {!user && <p className="text-center text-xs text-[#8da097]">Відгук доступний авторизованим користувачам</p>}
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}