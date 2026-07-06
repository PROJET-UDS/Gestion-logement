import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ArrowLeft, Check, Home as HomeIcon, User, Phone, AlertCircle } from 'lucide-react'
import { annonces } from '../data/data'

const creneaux = [
  { id: 1, date: '2026-07-15', heure: '08:00', disponible: true },
  { id: 2, date: '2026-07-15', heure: '10:00', disponible: true },
  { id: 3, date: '2026-07-15', heure: '14:00', disponible: false },
  { id: 4, date: '2026-07-15', heure: '16:00', disponible: true },
  { id: 5, date: '2026-07-16', heure: '09:00', disponible: true },
  { id: 6, date: '2026-07-16', heure: '11:00', disponible: true },
  { id: 7, date: '2026-07-16', heure: '15:00', disponible: false },
  { id: 8, date: '2026-07-17', heure: '10:00', disponible: true },
  { id: 9, date: '2026-07-17', heure: '14:00', disponible: true },
  { id: 10, date: '2026-07-17', heure: '16:00', disponible: true },
  { id: 11, date: '2026-07-18', heure: '09:00', disponible: true },
  { id: 12, date: '2026-07-18', heure: '11:00', disponible: true },
]

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const moisAnnee = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function NouvelleReservation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedCreneau, setSelectedCreneau] = useState(null)
  const [message, setMessage] = useState('')
  const [telephone, setTelephone] = useState('')
  const [nom, setNom] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const annonce = annonces.find(a => a.id === parseInt(id))

  if (!annonce) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-black mb-2">Annonce non trouvée</h3>
        <p className="text-gray-500 mb-6">Cette annonce n'existe pas.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedCreneau || !telephone || !nom) return
    setSubmitted(true)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${joursSemaine[date.getDay()]} ${date.getDate()} ${moisAnnee[date.getMonth()]}`
  }

  const creneauxParDate = creneaux.reduce((acc, creneau) => {
    if (!acc[creneau.date]) acc[creneau.date] = []
    acc[creneau.date].push(creneau)
    return acc
  }, {})

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={48} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-black mb-4">Demande envoyée avec succès !</h2>
        <p className="text-gray-600 mb-8">
          Votre demande de visite a été envoyée au propriétaire. Vous recevrez une confirmation par <strong>Orange Money</strong> ou <strong>SMS</strong>.
        </p>

        <div className="card bg-gray-50 text-left mb-8">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Récapitulatif de votre demande
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Logement</span>
              <span className="font-medium text-black">{annonce.titre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date prévue</span>
              <span className="font-medium text-black">{selectedCreneau && formatDate(selectedCreneau.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Heure</span>
              <span className="font-medium text-black">{selectedCreneau?.heure}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Propriétaire</span>
              <span className="font-medium text-black">{annonce.proprietaire.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact</span>
              <span className="font-medium text-black">{telephone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 justify-center">
          <AlertCircle size={16} />
          <span>Le propriétaire peut prendre 2-4 heures pour confirmer votre demande</span>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/reservations')} className="btn-primary">
            Voir mes réservations
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Explorer d'autres logements
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
        <ArrowLeft size={20} />
        Retour
      </button>

      <h2 className="text-3xl font-bold text-black mb-2">Nouvelle réservation de visite</h2>
      <p className="text-gray-600 mb-8">Sélectionnez un créneau qui vous convient pour visiter ce logement</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <img src={annonce.image} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
            <h3 className="font-bold text-black text-lg">{annonce.titre}</h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
              <MapPin size={14} />
              <span>{annonce.localisation}</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-4">{annonce.prix.toLocaleString()} FCFA<span className="text-sm font-normal text-gray-500">/mois</span></p>

            <div className="border-t mt-4 pt-4">
              <h4 className="font-semibold text-black mb-2">Propriétaire</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="text-primary" size={20} />
                </div>
                <div>
                  <p className="font-medium text-black">{annonce.proprietaire.nom}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone size={12} />
                    {annonce.proprietaire.telephone}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Les visites sont généralement confirmées sous 2-4 heures.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="card mb-6">
              <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                Sélectionnez un créneau
              </h3>

              <div className="space-y-4">
                {Object.entries(creneauxParDate).map(([date, creneauxJour]) => (
                  <div key={date}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">{formatDate(date)}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {creneauxJour.map((creneau) => (
                        <button
                          key={creneau.id}
                          type="button"
                          onClick={() => creneau.disponible && setSelectedCreneau(creneau)}
                          disabled={!creneau.disponible}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            !creneau.disponible
                              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : selectedCreneau?.id === creneau.id
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-primary'
                          }`}
                        >
                          <Clock size={14} className="mx-auto mb-1" />
                          <span className="text-sm font-medium">{creneau.heure}</span>
                          {!creneau.disponible && (
                            <span className="block text-xs opacity-75">Pris</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card mb-6">
              <h3 className="font-semibold text-black mb-4">Vos informations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Jean Kamga"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Téléphone (Orange/MoMo) *</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="6 XX XX XX XX"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="card mb-6">
              <h3 className="font-semibold text-black mb-4">Message au propriétaire (optionnel)</h3>
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Présentez-vous brièvement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-black mb-2">À savoir avant de réserver</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Les frais de réservation sont de <strong>3.000 à 10.000 FCFA</strong></li>
                <li>• Ces frais ne sont pas remboursables en cas d'annulation</li>
                <li>• Le propriétaire confirmera votre visite par téléphone</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!selectedCreneau || !nom || !telephone}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedCreneau && nom && telephone
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedCreneau && nom && telephone
                ? `Demander une visite le ${formatDate(selectedCreneau.date)} à ${selectedCreneau.heure}`
                : 'Sélectionnez un créneau et remplissez vos informations'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
