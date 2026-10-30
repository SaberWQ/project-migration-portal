import { useMemo, useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Activity, Bell, Bot, Check, ChevronRight, Coins, Droplets, Gauge, Home, Lightbulb, Menu, MessageSquare, Settings, ShoppingBag, Sprout, Target, Thermometer, Waves, Wifi, X, Zap } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { ProfileEditor } from '@/components/ProfileEditor'
import { supabase } from '@/lib/supabase'

type View = 'home' | 'analytics' | 'ai' | 'tasks' | 'shop' | 'settings'
type Language = 'Українська' | 'English' | 'Español' | 'Português'
type ThemeOption = 'Світла' | 'Темна' | 'Системна'

const translations = {
  'Українська': {
    nav: { home: 'Огляд', analytics: 'Аналітика', ai: 'Leafy AI', tasks: 'Квести', shop: 'Магазин', settings: 'Налаштування' },
    greeting: 'Доброго дня',
    leaveFeedback: 'Залишити відгук',
    noNotifications: 'Нових сповіщень немає',
    myPlant: 'Моя рослина',
    change: 'Змінити',
    systemStatus: 'Стан системи',
    allGood: 'Все працює добре',
    lastSync: 'Остання синхронізація',
    justNow: 'щойно',
    wifiStable: 'Wi-Fi стабільний',
    autoMode: 'Автоматичний режим',
    autoModeDesc: 'Налаштував і забув',
    autoModeInfo: 'Полив вмикається автоматично, коли вологість ґрунту нижче 30%.',
    currentReadings: 'Показники зараз',
    soil: 'Ґрунт',
    temp: 'Температура',
    air: 'Повітря',
    optimal: 'Оптимально',
    comfortable: 'Комфортно',
    normal: 'У нормі',
    soilMoisture: 'Вологість ґрунту',
    last7days: 'Останні 7 днів',
    waterSaved: 'Економія води',
    waterSavedDesc: 'Завдяки точковому поливу за останні 7 днів.',
    quickAction: 'Швидка дія',
    manualControl: 'Керуйте системою вручну',
    water5sec: 'Полити 5 секунд',
    wateringProgress: 'Полив триває…',
    lightControl: 'Керування світлом',
    waterActivated: 'Ручний полив активовано на 5 секунд',
    profileSettings: 'Налаштування профілю',
    profileSubtitle: 'Мова, тема, звуки та персональні дані SmartGrow',
    profileSynced: 'Профіль синхронізовано',
    changePhoto: 'Змінити фото',
    sessionsAndSecurity: 'Сесії та безпека',
    manageDevices: 'Керування активними пристроями',
    interfaceLanguage: 'Мова інтерфейсу',
    theme: 'Тема',
    leafySounds: 'Звуки Leafy',
    autoWatering: 'Автоматичний полив',
    enabled: 'Увімкнено',
    disabled: 'Вимкнено',
    themeLight: 'Світла',
    themeDark: 'Темна',
    themeSystem: 'Системна',
    translatorTitle: 'Перекладач Leafy',
    translatorDesc: 'Українська, English, Español та Português доступні для інтерфейсу й відповідей бота.'
  },
  'English': {
    nav: { home: 'Overview', analytics: 'Analytics', ai: 'Leafy AI', tasks: 'Quests', shop: 'Shop', settings: 'Settings' },
    greeting: 'Good day',
    leaveFeedback: 'Leave feedback',
    noNotifications: 'No new notifications',
    myPlant: 'My plant',
    change: 'Change',
    systemStatus: 'System status',
    allGood: 'All working well',
    lastSync: 'Last sync',
    justNow: 'just now',
    wifiStable: 'Wi-Fi stable',
    autoMode: 'Automatic mode',
    autoModeDesc: 'Set and forget',
    autoModeInfo: 'Watering turns on automatically when soil moisture drops below 30%.',
    currentReadings: 'Current readings',
    soil: 'Soil',
    temp: 'Temperature',
    air: 'Air',
    optimal: 'Optimal',
    comfortable: 'Comfortable',
    normal: 'Normal',
    soilMoisture: 'Soil moisture',
    last7days: 'Last 7 days',
    waterSaved: 'Water saved',
    waterSavedDesc: 'Thanks to precision watering over the last 7 days.',
    quickAction: 'Quick action',
    manualControl: 'Control system manually',
    water5sec: 'Water for 5 sec',
    wateringProgress: 'Watering in progress…',
    lightControl: 'Light control',
    waterActivated: 'Manual watering activated for 5 seconds',
    profileSettings: 'Profile Settings',
    profileSubtitle: 'Language, theme, sounds, and SmartGrow personal data',
    profileSynced: 'Profile synced',
    changePhoto: 'Change photo',
    sessionsAndSecurity: 'Sessions & Security',
    manageDevices: 'Manage active devices',
    interfaceLanguage: 'Interface Language',
    theme: 'Theme',
    leafySounds: 'Leafy sounds',
    autoWatering: 'Automatic watering',
    enabled: 'Enabled',
    disabled: 'Disabled',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    translatorTitle: 'Leafy Translator',
    translatorDesc: 'Ukrainian, English, Spanish, and Portuguese are available for interface and bot responses.'
  },
  'Español': {
    nav: { home: 'Resumen', analytics: 'Analítica', ai: 'Leafy AI', tasks: 'Misiones', shop: 'Tienda', settings: 'Ajustes' },
    greeting: 'Buenos días',
    leaveFeedback: 'Dejar comentarios',
    noNotifications: 'Sin notificaciones nuevas',
    myPlant: 'Mi planta',
    change: 'Cambiar',
    systemStatus: 'Estado del sistema',
    allGood: 'Todo funciona bien',
    lastSync: 'Última sincronización',
    justNow: 'ahora mismo',
    wifiStable: 'Wi-Fi estable',
    autoMode: 'Modo automático',
    autoModeDesc: 'Configura y olvídate',
    autoModeInfo: 'El riego se activa automáticamente cuando la humedad del suelo cae por debajo del 30%.',
    currentReadings: 'Lecturas actuales',
    soil: 'Suelo',
    temp: 'Temperatura',
    air: 'Aire',
    optimal: 'Óptimo',
    comfortable: 'Cómodo',
    normal: 'Normal',
    soilMoisture: 'Humedad del suelo',
    last7days: 'Últimos 7 días',
    waterSaved: 'Agua ahorrada',
    waterSavedDesc: 'Gracias al riego de precisión en los últimos 7 días.',
    quickAction: 'Acción rápida',
    manualControl: 'Controlar el sistema manualmente',
    water5sec: 'Regar 5 segundos',
    wateringProgress: 'Regando…',
    lightControl: 'Control de luz',
    waterActivated: 'Riego manual activado por 5 segundos',
    profileSettings: 'Ajustes del perfil',
    profileSubtitle: 'Idioma, tema, sonidos y datos personales de SmartGrow',
    profileSynced: 'Perfil sincronizado',
    changePhoto: 'Cambiar foto',
    sessionsAndSecurity: 'Sesiones y seguridad',
    manageDevices: 'Gestionar dispositivos activos',
    interfaceLanguage: 'Idioma de la interfaz',
    theme: 'Tema',
    leafySounds: 'Sonidos de Leafy',
    autoWatering: 'Riego automático',
    enabled: 'Activado',
    disabled: 'Desactivado',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Sistema',
    translatorTitle: 'Traductor de Leafy',
    translatorDesc: 'Ucraniano, inglés, español y portugués disponibles para la interfaz y el bot.'
  },
  'Português': {
    nav: { home: 'Visão geral', analytics: 'Análise', ai: 'Leafy AI', tasks: 'Missões', shop: 'Loja', settings: 'Configurações' },
    greeting: 'Bom dia',
    leaveFeedback: 'Deixar feedback',
    noNotifications: 'Sem novas notificações',
    myPlant: 'Minha planta',
    change: 'Alterar',
    systemStatus: 'Status do sistema',
    allGood: 'Tudo funcionando bem',
    lastSync: 'Última sincronização',
    justNow: 'agora mesmo',
    wifiStable: 'Wi-Fi estável',
    autoMode: 'Modo automático',
    autoModeDesc: 'Configure e esqueça',
    autoModeInfo: 'A irrigação é ativada automaticamente quando a umidade do solo cai abaixo de 30%.',
    currentReadings: 'Leituras atuais',
    soil: 'Solo',
    temp: 'Temperatura',
    air: 'Ar',
    optimal: 'Ideal',
    comfortable: 'Confortável',
    normal: 'Normal',
    soilMoisture: 'Umidade do solo',
    last7days: 'Últimos 7 dias',
    waterSaved: 'Água economizada',
    waterSavedDesc: 'Graças à irrigação de precisão nos últimos 7 dias.',
    quickAction: 'Ação rápida',
    manualControl: 'Controlar o sistema manualmente',
    water5sec: 'Regar por 5 seg',
    wateringProgress: 'Regando…',
    lightControl: 'Controle de luz',
    waterActivated: 'Irrigação manual ativada por 5 segundos',
    profileSettings: 'Configurações do perfil',
    profileSubtitle: 'Idioma, tema, sons e dados pessoais do SmartGrow',
    profileSynced: 'Perfil sincronizado',
    changePhoto: 'Alterar foto',
    sessionsAndSecurity: 'Sessões e segurança',
    manageDevices: 'Gerenciar dispositivos ativos',
    interfaceLanguage: 'Idioma da interface',
    theme: 'Tema',
    leafySounds: 'Sons do Leafy',
    autoWatering: 'Irrigação automática',
    enabled: 'Ativado',
    disabled: 'Desativado',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    themeSystem: 'Sistema',
    translatorTitle: 'Tradutor do Leafy',
    translatorDesc: 'Ucraniano, inglês, espanhol e português disponíveis para a interface e bot.'
  }
}

const week = [38, 44, 41, 48, 46, 52, 42]

export function SmartGrowDashboard() {
  const [view, setView] = useState<View>('home')
  const [autoMode, setAutoMode] = useState(true)
  const [pumpRunning, setPumpRunning] = useState(false)
  const [notification, setNotification] = useState('')
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState<string[]>([])
  const [coins, setCoins] = useState(1250)
  const [bought, setBought] = useState<number[]>([])
  const [language, setLanguage] = useState<Language>('Українська')

  // Управление темой оформления
  const [theme, setTheme] = useState<ThemeOption>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('smartgrow_theme') as ThemeOption) || 'Світла'
    }
    return 'Світла'
  })

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    localStorage.setItem('smartgrow_theme', theme)
    const checkDark = () => {
      if (theme === 'Темна') return true
      if (theme === 'Системна') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return false
    }

    const dark = checkDark()
    setIsDark(dark)

    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const t = translations[language] || translations['Українська']

  const [chat, setChat] = useState<{ from: 'user' | 'leafy'; text: string }[]>([
    { from: 'leafy', text: 'Привіт! Я Leafy. Допоможу стежити за здоров’ям Монстери.' },
  ])

  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      const emailPrefix = user.email ? user.email.split('@')[0] : 'User'

      setProfile({
        full_name: data?.full_name || emailPrefix,
        avatar_url: data?.avatar_url || '',
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const navItems: { id: View; label: string; icon: typeof Home }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'analytics', label: t.nav.analytics, icon: Activity },
    { id: 'ai', label: t.nav.ai, icon: Bot },
    { id: 'tasks', label: t.nav.tasks, icon: Target },
    { id: 'shop', label: t.nav.shop, icon: ShoppingBag },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ]

  const lastUpdated = useMemo(() => t.justNow, [pumpRunning, t])

  const runPump = () => {
    setPumpRunning(true)
    setNotification(t.waterActivated)
    window.setTimeout(() => setPumpRunning(false), 5000)
  }

  const sendMessage = () => {
    if (!message.trim()) return
    setChat((items) => [...items, { from: 'user', text: message }, { from: 'leafy', text: 'За даними сенсорів усе добре. Вологість ґрунту 42%, наступний полив орієнтовно через 4 години.' }])
    setMessage('')
  }

  const displayName = profile?.full_name || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <main className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#121c18] text-[#e1ece6]' : 'bg-[#f7f8f3] text-[#17372d]'}`}>
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col lg:flex-row">
        <aside className={`hidden w-[250px] shrink-0 flex-col border-r px-7 py-8 lg:flex ${isDark ? 'border-[#263a32] bg-[#172520]' : 'border-[#dfe8df] bg-[#f1f5ed]'}`}>
          <Brand />
          <nav className="mt-14 flex flex-col gap-2" aria-label="Main Navigation">
            {navItems.map((item) => <NavItem key={item.id} {...item} active={view === item.id} isDark={isDark} onClick={() => setView(item.id)} />)}
          </nav>
          <div className={`mt-auto rounded-3xl p-5 ${isDark ? 'bg-[#1d332a]' : 'bg-[#dfeee0]'}`}>
            <Sprout className="size-6 text-[#8ac79b]" />
            <p className="mt-5 text-sm font-semibold leading-5">Smart care made simple.</p>
          </div>
        </aside>

        <section className="flex-1 px-5 pb-28 pt-6 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <header className="flex items-center justify-between">
            <div className="lg:hidden"><Brand compact /></div>
            <div className="hidden lg:block">
              <p className={`text-sm font-medium ${isDark ? 'text-[#8da59a]' : 'text-[#739084]'}`}>Wednesday, Oct 21</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{t.greeting}, {displayName}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/feedback" className="flex items-center gap-2 rounded-full bg-[#c8e86a] px-3 py-2 sm:px-4 text-sm font-semibold text-[#21483e] transition hover:bg-[#b9dc5c]">
                <MessageSquare className="size-4" />
                <span className="hidden sm:inline">{t.leaveFeedback}</span>
              </Link>
              
              <button aria-label="Notifications" onClick={() => setNotification(t.noNotifications)} className={`relative grid size-10 place-items-center rounded-full border ${isDark ? 'border-[#2a3d35] bg-[#1a2823] text-[#8da59a]' : 'border-[#dfe8df] bg-white text-[#4d7161]'}`}>
                <Bell className="size-[18px]" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e28c61]" />
              </button>

              <button aria-label="Menu" onClick={() => setView('home')} className={`grid size-10 place-items-center rounded-full border ${isDark ? 'border-[#2a3d35] bg-[#1a2823] text-[#8da59a]' : 'border-[#dfe8df] bg-white text-[#4d7161]'} lg:hidden`}>
                <Menu className="size-[18px]" />
              </button>

              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="hidden size-10 rounded-full object-cover border border-[#dfe8df] sm:block" />
              ) : (
                <div className="hidden size-10 place-items-center rounded-full bg-[#c8dfc9] text-sm font-semibold text-[#285d49] sm:grid">{initials}</div>
              )}

              <LogoutButton />
            </div>
          </header>

          {notification && <div className="mt-4 flex items-center justify-between rounded-xl bg-[#e4f0df] px-4 py-3 text-sm text-[#39795d]"><span className="flex items-center gap-2"><Check className="size-4" />{notification}</span><button onClick={() => setNotification('')} aria-label="Close"><X className="size-4" /></button></div>}
          {view === 'home' && <HomeView autoMode={autoMode} setAutoMode={setAutoMode} pumpRunning={pumpRunning} runPump={runPump} setView={setView} lastUpdated={lastUpdated} t={t} isDark={isDark} />}
          {view === 'analytics' && <AnalyticsView isDark={isDark} />}
          {view === 'ai' && <AiView chat={chat} message={message} setMessage={setMessage} sendMessage={sendMessage} isDark={isDark} />}
          {view === 'tasks' && <TasksView completed={completed} setCompleted={setCompleted} setCoins={setCoins} />}
          {view === 'shop' && <ShopView coins={coins} bought={bought} setBought={setBought} setCoins={setCoins} />}
          {view === 'settings' && <SettingsView language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} autoMode={autoMode} setAutoMode={setAutoMode} profile={profile} onProfileUpdate={fetchProfile} t={t} isDark={isDark} />}
        </section>
      </div>
      <nav className={`fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-md items-center justify-around rounded-2xl border p-2 shadow-lg backdrop-blur lg:hidden ${isDark ? 'border-[#2a3d35] bg-[#1a2823]/95' : 'border-[#deeadf] bg-white/95'}`}>{navItems.slice(0, 5).map((item) => <MobileNavItem key={item.id} {...item} active={view === item.id} isDark={isDark} onClick={() => setView(item.id)} />)}</nav>
    </main>
  )
}

function HomeView({ autoMode, setAutoMode, pumpRunning, runPump, setView, lastUpdated, t, isDark }: { autoMode: boolean; setAutoMode: (v: boolean) => void; pumpRunning: boolean; runPump: () => void; setView: (v: View) => void; lastUpdated: string; t: typeof translations['Українська']; isDark: boolean }) {
  const readings = [
    { label: t.soil, value: '42', unit: '%', icon: Droplets, detail: t.optimal },
    { label: t.temp, value: '22.5', unit: '°C', icon: Thermometer, detail: t.comfortable },
    { label: t.air, value: '58', unit: '%', icon: Waves, detail: t.normal },
  ]

  const cardBg = isDark ? 'bg-[#1a2823] border-[#2a3d35]' : 'bg-white border-[#e3ebe3]'

  return (
    <>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-[#8da59a]' : 'text-[#739084]'}`}>{t.myPlant}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Монстера</h2>
        </div>
        <button onClick={() => setView('settings')} className="flex items-center gap-1 text-sm font-semibold text-[#5cb887] cursor-pointer">
          {t.change} <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-[28px] bg-[#1e493b] p-6 text-white sm:p-8">
          <div className="relative z-10 flex min-h-[194px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#b5d8bd]">{t.systemStatus}</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold"><span className="size-2 rounded-full bg-[#9be0a8]" /> {t.allGood}</p>
              </div>
              <div className="rounded-full bg-white/10 p-3"><Wifi className="size-5 text-[#b5d8bd]" /></div>
            </div>
            <div>
              <p className="text-xs text-[#b5d8bd]">{t.lastSync} · {lastUpdated}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[82%] rounded-full bg-[#9be0a8]" /></div>
                <span className="text-xs text-[#b5d8bd]">{t.wifiStable}</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -top-16 size-64 rounded-full border-[28px] border-white/5" />
        </div>

        <div className={`rounded-[28px] p-6 sm:p-8 ${isDark ? 'bg-[#183328] text-[#d1e8dc]' : 'bg-[#e4f0df] text-[#17372d]'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-[#8da59a]' : 'text-[#668677]'}`}>{t.autoMode}</p>
              <p className="mt-2 text-2xl font-semibold">{t.autoModeDesc}</p>
            </div>
            <button onClick={() => setAutoMode(!autoMode)} aria-pressed={autoMode} className={`relative h-7 w-12 rounded-full p-1 cursor-pointer transition-colors ${autoMode ? 'bg-[#39795d]' : 'bg-[#aebdb2]'}`}>
              <span className={`block size-5 rounded-full bg-white transition-transform ${autoMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <p className={`mt-8 text-sm leading-6 ${isDark ? 'text-[#a3beb1]' : 'text-[#668677]'}`}>{t.autoModeInfo}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.currentReadings}</h2>
        <Gauge className="size-5 text-[#739084]" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-4">
        {readings.map(({ label, value, unit, icon: Icon, detail }) => (
          <div key={label} className={`rounded-2xl border p-4 sm:p-5 ${cardBg}`}>
            <div className="grid size-9 place-items-center rounded-xl bg-[#e1f2e4] text-[#438463]"><Icon className="size-[18px]" /></div>
            <p className={`mt-5 text-xs ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{label}</p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">{value}<span className={`ml-0.5 text-sm font-medium ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{unit}</span></p>
            <p className="mt-2 text-[11px] font-medium text-[#57916f]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className={`rounded-[24px] border p-5 sm:p-6 ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{t.soilMoisture}</h2>
              <p className={`mt-1 text-xs ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{t.last7days}</p>
            </div>
            <span className="rounded-full bg-[#e6f3e8] px-3 py-1 text-xs font-semibold text-[#438463]">+8.4%</span>
          </div>
          <div className="mt-8 flex h-32 items-end gap-2 sm:gap-4">
            {week.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className={`relative w-full rounded-t-lg ${isDark ? 'bg-[#22382e]' : 'bg-[#e9f3e9]'}`} style={{ height: `${value - 1.7}px`, maxHeight: 96 }}>
                  <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-[#75b886]" style={{ height: `${Math.max(35, value * 1.3)}%` }} />
                </div>
                <span className={`text-[10px] ${isDark ? 'text-[#8da59a]' : 'text-[#91a59b]'}`}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-[24px] p-5 sm:p-6 ${isDark ? 'bg-[#2a2419] text-[#e0cfb8]' : 'bg-[#f1e9d8] text-[#5b4931]'}`}>
          <p className="text-sm font-medium opacity-80">{t.waterSaved}</p>
          <p className="mt-3 text-3xl font-semibold">1.8 <span className="text-sm font-medium">L</span></p>
          <p className="mt-8 text-xs leading-5 opacity-80">{t.waterSavedDesc}</p>
        </div>
      </div>

      <div className={`mt-8 rounded-[24px] border p-5 sm:p-6 ${cardBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{t.quickAction}</h2>
            <p className={`mt-1 text-xs ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{t.manualControl}</p>
          </div>
          <Zap className="size-5 text-[#729184]" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={runPump} disabled={pumpRunning} className="flex items-center justify-center gap-3 rounded-2xl bg-[#2f7056] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#245b45] disabled:opacity-60 cursor-pointer">
            <Droplets className="size-5" />
            {pumpRunning ? t.wateringProgress : t.water5sec}
          </button>
          <button onClick={() => setView('settings')} className={`flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold cursor-pointer ${isDark ? 'bg-[#22382e] text-[#82cca0]' : 'bg-[#f4f7f2] text-[#3e6c57]'}`}>
            <Lightbulb className="size-5" />
            {t.lightControl}
          </button>
        </div>
      </div>
    </>
  )
}

function AnalyticsView({ isDark }: { isDark?: boolean }) { const cardBg = isDark ? 'bg-[#1a2823] border-[#2a3d35]' : 'bg-white border-[#e3ebe3]'; return <Page title="Analytics" subtitle="Sensor metrics history"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ n: '22.5°C', l: 'Temperature' }, { n: '58%', l: 'Air Humidity' }, { n: '42%', l: 'Soil Moisture' }, { n: '6.2', l: 'pH Level' }].map((x) => <div key={x.l} className={`rounded-2xl border p-5 ${cardBg}`}><p className="text-2xl font-semibold">{x.n}</p><p className="mt-2 text-sm opacity-70">{x.l}</p><span className="mt-4 inline-flex rounded-full bg-[#e6f3e8] px-2 py-1 text-xs text-[#438463]">Online</span></div>)}</div></Page> }
function AiView({ chat, message, setMessage, sendMessage, isDark }: { chat: { from: string; text: string }[]; message: string; setMessage: (v: string) => void; sendMessage: () => void; isDark?: boolean }) { const cardBg = isDark ? 'bg-[#1a2823] border-[#2a3d35]' : 'bg-white border-[#e3ebe3]'; return <Page title="Leafy AI" subtitle="Smart assistant"><div className={`flex min-h-[400px] flex-col rounded-[24px] border p-5 ${cardBg}`}><div className="flex-1 space-y-4">{chat.map((m, i) => <div key={i} className={`flex gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}><div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e1f2e4]"><Sprout className="size-5 text-[#438463]" /></div><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.from === 'user' ? 'bg-[#2f7056] text-white' : isDark ? 'bg-[#263c32] text-[#d6eade]' : 'bg-[#f1f5ed] text-[#315847]'}`}>{m.text}</div></div>)}</div><div className="mt-5 flex gap-2"><input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask Leafy..." className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none ${isDark ? 'border-[#2a3d35] bg-[#121c18]' : 'border-[#dfe8df] bg-white'}`} /><button onClick={sendMessage} className="rounded-xl bg-[#2f7056] px-5 text-sm font-semibold text-white cursor-pointer">Send</button></div></div></Page> }
function TasksView({ completed, setCompleted, setCoins }: { completed: string[]; setCompleted: (v: string[]) => void; setCoins: (v: number) => void }) { return <Page title="Quests" subtitle="Earn rewards"><div className="rounded-[24px] bg-[#1e493b] p-6 text-white"><h2 className="text-2xl font-semibold">Leafy needs water</h2></div></Page> }
function ShopView({ coins, bought, setBought, setCoins }: { coins: number; bought: number[]; setBought: (v: number[]) => void; setCoins: (v: number) => void }) { return <Page title="Shop" subtitle="Skins & Tokens"><div className="rounded-2xl bg-[#f1e9d8] p-5"><p className="font-semibold text-[#5b4931]">Balance: {coins} coins</p></div></Page> }

function SettingsView({ 
  language, 
  setLanguage, 
  theme,
  setTheme,
  autoMode, 
  setAutoMode, 
  profile, 
  onProfileUpdate,
  t,
  isDark
}: { 
  language: Language; 
  setLanguage: (v: Language) => void; 
  theme: ThemeOption;
  setTheme: (v: ThemeOption) => void;
  autoMode: boolean; 
  setAutoMode: (v: boolean) => void;
  profile: { full_name?: string; avatar_url?: string } | null;
  onProfileUpdate: () => void;
  t: typeof translations['Українська'];
  isDark: boolean;
}) { 
  const [sound, setSound] = useState(true)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const displayName = profile?.full_name || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const cardBg = isDark ? 'bg-[#1a2823] border-[#2a3d35]' : 'bg-white border-[#e3ebe3]'

  return (
    <Page title={t.profileSettings} subtitle={t.profileSubtitle}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex flex-wrap items-center gap-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="size-16 rounded-full object-cover border border-[#dfe8df]" />
            ) : (
              <div className="grid size-16 place-items-center rounded-full bg-[#c8dfc9] text-lg font-bold text-[#285d49]">
                {initials}
              </div>
            )}

            <div>
              <p className="font-semibold">{displayName}</p>
              <p className={`text-sm ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{t.profileSynced}</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition cursor-pointer ${isDark ? 'border-[#2a3d35] hover:bg-[#22382e]' : 'border-[#dfe8df] hover:bg-gray-50'}`}
              >
                {t.changePhoto}
              </button>
              <LogoutButton />
            </div>
          </div>

          <button className={`mt-5 w-full rounded-xl border p-4 text-left text-sm cursor-pointer ${isDark ? 'border-[#2a3d35]' : 'border-[#e3ebe3]'}`}>
            <span className="font-semibold">{t.sessionsAndSecurity}</span>
            <span className={`mt-1 block text-xs ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{t.manageDevices}</span>
          </button>
        </div>

        <div className="space-y-4">
          {[
            [t.interfaceLanguage, language, 
              <select 
                key="language" 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)} 
                className={`rounded-lg border px-3 py-2 text-sm cursor-pointer ${isDark ? 'border-[#2a3d35] bg-[#121c18] text-white' : 'border-[#dfe8df] bg-white text-black'}`}
              >
                <option value="Українська">Українська</option>
                <option value="English">English</option>
                <option value="Español">Español</option>
                <option value="Português">Português</option>
              </select>
            ],
            [t.theme, theme, 
              <select 
                key="theme" 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as ThemeOption)} 
                className={`rounded-lg border px-3 py-2 text-sm cursor-pointer ${isDark ? 'border-[#2a3d35] bg-[#121c18] text-white' : 'border-[#dfe8df] bg-white text-black'}`}
              >
                <option value="Світла">{t.themeLight}</option>
                <option value="Темна">{t.themeDark}</option>
                <option value="Системна">{t.themeSystem}</option>
              </select>
            ],
            [t.leafySounds, sound ? t.enabled : t.disabled, 
              <button 
                key="sound" 
                onClick={() => setSound(!sound)} 
                aria-pressed={sound} 
                className={`h-7 w-12 rounded-full p-1 cursor-pointer transition-colors ${sound ? 'bg-[#39795d]' : 'bg-[#aebdb2]'}`}
              >
                <span className={`block size-5 rounded-full bg-white transition-transform ${sound ? 'translate-x-5' : ''}`} />
              </button>
            ],
            [t.autoWatering, autoMode ? t.enabled : t.disabled, 
              <button 
                key="auto" 
                onClick={() => setAutoMode(!autoMode)} 
                className={`h-7 w-12 rounded-full p-1 cursor-pointer transition-colors ${autoMode ? 'bg-[#39795d]' : 'bg-[#aebdb2]'}`}
              >
                <span className={`block size-5 rounded-full bg-white transition-transform ${autoMode ? 'translate-x-5' : ''}`} />
              </button>
            ]
          ].map(([title, desc, control]) => (
            <div key={String(title)} className={`flex items-center justify-between rounded-2xl border p-5 ${cardBg}`}>
              <div>
                <p className="font-semibold">{title}</p>
                <p className={`mt-1 text-sm ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>{desc}</p>
              </div>
              {control}
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-5 rounded-2xl border p-5 ${cardBg}`}>
        <p className="font-semibold">{t.translatorTitle}</p>
        <p className={`mt-1 text-sm ${isDark ? 'text-[#8da59a]' : 'text-[#789084]'}`}>
          {t.translatorDesc}
        </p>
      </div>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-xl ${isDark ? 'bg-[#1a2823] text-white border border-[#2a3d35]' : 'bg-white text-black'}`}>
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false)
                onProfileUpdate()
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <ProfileEditor />
          </div>
        </div>
      )}
    </Page>
  )
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <div className="mt-8"><p className="text-sm font-medium opacity-80">SmartGrow SecureAI</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{title}</h2><p className="mt-2 text-sm opacity-70">{subtitle}</p><div className="mt-6">{children}</div></div> }
function Brand({ compact = false }: { compact?: boolean }) { return <div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-xl bg-[#2f7056] text-white"><Sprout className="size-5" /></div>{!compact && <div><p className="font-semibold tracking-[-0.03em]">SmartGrow</p><p className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-70">AI garden</p></div>}</div> }
function NavItem({ icon: Icon, label, active, isDark, onClick }: { icon: typeof Home; label: string; active: boolean; isDark?: boolean; onClick: () => void }) { return <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer ${active ? 'bg-[#2f7056] text-white' : isDark ? 'text-[#8da59a] hover:bg-[#22382e]' : 'text-[#789084] hover:bg-white'}`}><Icon className="size-[18px]" />{label}</button> }
function MobileNavItem({ icon: Icon, label, active, isDark, onClick }: { icon: typeof Home; label: string; active: boolean; isDark?: boolean; onClick: () => void }) { return <button onClick={onClick} className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold cursor-pointer ${active ? 'bg-[#2f7056] text-white' : isDark ? 'text-[#8da59a]' : 'text-[#81958b]'}`}><Icon className="size-[18px]" />{label}</button> }