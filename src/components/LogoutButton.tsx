import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const logoutTranslations = {
  'Українська': 'Вийти',
  'English': 'Log out',
  'Español': 'Cerrar sesión',
  'Português': 'Sair',
}

type Language = keyof typeof logoutTranslations

export function LogoutButton() {
  const [lang, setLang] = useState<Language>('Українська')

  useEffect(() => {
    const updateLang = () => {
      const saved = localStorage.getItem('smartgrow_language') as Language
      if (saved && logoutTranslations[saved]) {
        setLang(saved)
      }
    }

    updateLang()

    // Отслеживаем изменения localStorage
    window.addEventListener('storage', updateLang)
    return () => window.removeEventListener('storage', updateLang)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const text = logoutTranslations[lang] || logoutTranslations['Українська']

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/20 cursor-pointer"
    >
      <LogOut className="size-4" />
      <span>{text}</span>
    </button>
  )
}