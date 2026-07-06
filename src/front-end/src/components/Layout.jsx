import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { MapPin, Home, Calendar, User, MessageSquare, LogOut, Bell, Settings, ChevronDown, Sun, Moon, Monitor, X, Check } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: MapPin, label: 'Logements', path: '/annonces' },
  { icon: Calendar, label: 'Réservations', path: '/reservations' },
  { icon: MessageSquare, label: 'Messages', path: '/messagerie', badge: 3 },
  { icon: User, label: 'Profil', path: '/profile' },
]

const notifications = [
  { id: 1, type: 'en_attente', title: '2 réservations en attente', message: 'Vos demandes de visite sont en cours de validation', time: 'Il y a 2h' },
  { id: 2, type: 'confirmee', title: '1 réservation confirmée', message: 'Mme Fouda a confirmé votre visite', time: 'Il y a 4h' },
  { id: 3, type: 'terminee', title: '1 réservation terminée', message: 'Votre visite à Bastos est terminée', time: 'Il y a 1j' },
  { id: 4, type: 'welcome', title: 'Bienvenue sur LogisConnect!', message: 'Trouvez votre logement idéal au Cameroun', time: 'Il y a 2j' },
]

const themes = [
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'system', label: 'Système', icon: Monitor },
]

export default function Layout() {
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [vibrate, setVibrate] = useState(false)
  const [theme, setTheme] = useState('light')
  const notifRef = useRef(null)
  const settingsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotifClick = () => {
    setShowNotifications(!showNotifications)
    setShowSettings(false)
    setVibrate(true)
    setTimeout(() => setVibrate(false), 500)
  }

  const handleThemeChange = (themeId) => {
    setTheme(themeId)
    if (themeId === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setShowSettings(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="w-72 bg-black text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Home className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LogisConnect</h1>
              <p className="text-xs text-gray-400">Gestion logement</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="text-gray-300" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Jean Kamga</p>
              <p className="text-xs text-gray-400">Locataire</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8">
        <header className="bg-white rounded-xl shadow-sm p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un logement..."
                className="w-80 px-4 py-2 pl-10 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifClick}
                className={`relative p-2 text-gray-500 hover:text-primary transition-all ${vibrate ? 'animate-vibrate' : ''}`}
              >
                <Bell size={20} className={showNotifications ? 'text-primary' : ''} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-black">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notif.type === 'en_attente' ? 'bg-yellow-500' :
                            notif.type === 'confirmee' ? 'bg-green-500' :
                            notif.type === 'terminee' ? 'bg-blue-500' : 'bg-primary'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-black text-sm">{notif.title}</p>
                            <p className="text-gray-500 text-xs mt-1">{notif.message}</p>
                            <p className="text-gray-400 text-xs mt-2">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => { setShowSettings(!showSettings); setShowNotifications(false) }}
                className={`p-2 transition-all ${showSettings ? 'text-primary bg-primary/10 rounded-lg' : 'text-gray-500 hover:text-primary'}`}
              >
                <Settings size={20} />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-black">Paramètres</h3>
                  </div>
                  <div className="p-2">
                    <p className="px-3 py-2 text-sm text-gray-500 font-medium">Thème</p>
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          theme === t.id ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <t.icon size={18} />
                        <span className="flex-1 text-left text-sm">{t.label}</span>
                        {theme === t.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <Outlet />
      </main>

      <style>{`
        @keyframes vibrate {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
        }
        .animate-vibrate {
          animation: vibrate 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
