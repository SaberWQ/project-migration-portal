import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const logoutTranslations = {
  'Українська': 'Вийти',
  'English': 'Log out',
  'Español': 'Cerrar sesión',
  'Português': 'Sair',
}

type Language = keyof typeof logoutTranslations

interface LogoutButtonProps {
  language?: Language
}

export function LogoutButton({ language }: LogoutButtonProps) {
  const currentLang = language || (typeof window !== 'undefined' ? (localStorage.getItem('smartgrow_language') as Language) : 'Українська') || 'Українська'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const text = logoutTranslations[currentLang] || logoutTranslations['Українська']

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