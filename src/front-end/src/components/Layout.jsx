import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { MapPin, Home, Calendar, User, MessageSquare, LogOut, Bell, Settings, ChevronDown, Sun, Moon, Monitor, X, Check, Menu, Home as HomeIcon } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: MapPin, label: 'Logements', path: '/annonces' },
  { icon: Calendar, label: 'Réservations', path: '/reservations' },
  { icon: MessageSquare, label: 'Messages', path: '/messagerie', badge: 3 },
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

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
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar - always visible */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 bg-black text-white flex flex-col h-screen">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <HomeIcon className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LogisConnect</h1>
            <p className="text-xs text-gray-400">Gestion logement</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
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
            <li>
              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <User size={20} />
                <span className="flex-1">Profil</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User & Logout */}
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

      {/* Mobile Sidebar - slides in from left */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-black text-white flex flex-col h-screen
        lg:hidden transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <HomeIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LogisConnect</h1>
              <p className="text-xs text-gray-400">Gestion logement</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
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
            <li>
              <Link
                to="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <User size={20} />
                <span className="flex-1">Profil</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User & Logout */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-primary">LogisConnect</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleNotifClick} className="p-2 relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={() => { setShowSettings(!showSettings); setShowNotifications(false) }} className="p-2">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Notifications Dropdown - Mobile */}
        {showNotifications && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-black">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
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
          </div>
        )}

        {/* Settings Dropdown - Mobile */}
        {showSettings && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
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
          </div>
        )}

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white shadow-sm p-4 mb-6 items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="text-base">
              <span className="text-gray-500">Bienvenue, </span>
              <span className="font-bold text-primary">Jean Kamga</span>
            </div>
            <button 
              onClick={() => {
                const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                alert(`Nous sommes le ${today}`)
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
            >
              <Calendar size={16} />
              <span className="hidden xl:inline">
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </button>
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

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

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
