import { MapPin, Search } from 'lucide-react'

export default function Login() {
  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-black text-center mb-6">Connexion</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">Email</label>
            <input type="email" className="input-field" placeholder="votre@email.com" />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2">Mot de passe</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary w-full">Se connecter</button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Pas de compte? <a href="/register" className="text-primary font-medium">Inscrivez-vous</a>
        </p>
      </div>
    </div>
  )
}
