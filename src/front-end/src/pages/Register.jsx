export default function Register() {
  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-black text-center mb-6">Inscription</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">Nom complet</label>
            <input type="text" className="input-field" placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2">Email</label>
            <input type="email" className="input-field" placeholder="votre@email.com" />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2">Téléphone</label>
            <input type="tel" className="input-field" placeholder="07 XX XX XX XX" />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2">Mot de passe</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-2">Je suis</label>
            <select className="input-field">
              <option>Locataire</option>
              <option>Propriétaire</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">S'inscrire</button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Déjà un compte? <a href="/login" className="text-primary font-medium">Connectez-vous</a>
        </p>
      </div>
    </div>
  )
}
