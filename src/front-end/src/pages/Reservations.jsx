import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Phone, Search } from 'lucide-react'
import { reservations } from '../data/data'

const statutConfig = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  confirmee: { label: 'Confirmée', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  terminee: { label: 'Terminée', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle }
}

export default function Reservations() {
  const [filter, setFilter] = useState('tous')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredReservations = reservations.filter(r => {
    const matchSearch = searchTerm === '' ||
      r.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.localisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.proprietaire.toLowerCase().includes(searchTerm.toLowerCase())
    const matchFilter = filter === 'tous' || r.statut === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: reservations.length,
    en_attente: reservations.filter(r => r.statut === 'en_attente').length,
    confirmee: reservations.filter(r => r.statut === 'confirmee').length,
    terminee: reservations.filter(r => r.statut === 'terminee').length
  }

  const formatPrix = (prix) => new Intl.NumberFormat('fr-CM').format(prix)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Mes réservations</h2>
        <p className="text-gray-600">Suivez l'état de vos demandes de visite</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une réservation..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setFilter('tous')}
          className={`p-4 rounded-xl border-2 transition-all ${filter === 'tous' ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/50'}`}
        >
          <p className="text-3xl font-bold text-black">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </button>
        <button
          onClick={() => setFilter('en_attente')}
          className={`p-4 rounded-xl border-2 transition-all ${filter === 'en_attente' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-300'}`}
        >
          <p className="text-3xl font-bold text-yellow-600">{stats.en_attente}</p>
          <p className="text-sm text-gray-600">En attente</p>
        </button>
        <button
          onClick={() => setFilter('confirmee')}
          className={`p-4 rounded-xl border-2 transition-all ${filter === 'confirmee' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
        >
          <p className="text-3xl font-bold text-green-600">{stats.confirmee}</p>
          <p className="text-sm text-gray-600">Confirmées</p>
        </button>
        <button
          onClick={() => setFilter('terminee')}
          className={`p-4 rounded-xl border-2 transition-all ${filter === 'terminee' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
        >
          <p className="text-3xl font-bold text-blue-600">{stats.terminee}</p>
          <p className="text-sm text-gray-600">Terminées</p>
        </button>
      </div>

      <div className="space-y-4">
        {filteredReservations.map((reservation) => {
          const config = statutConfig[reservation.statut]
          const StatusIcon = config.icon

          return (
            <div key={reservation.id} className="card hover:shadow-lg transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={reservation.image}
                    alt={reservation.titre}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-black text-lg">{reservation.titre}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                          <MapPin size={14} />
                          <span>{reservation.localisation}</span>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
                        <StatusIcon size={14} />
                        {config.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-gray-700">{new Date(reservation.datevisite).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-primary" />
                        <span className="text-gray-700">à {reservation.heure}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-primary" />
                        <span className="text-gray-700">{reservation.proprietaire}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-gray-500">Frais de réservation: <span className="font-semibold text-black">{formatPrix(reservation.montant)} FCFA</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                  {reservation.statut === 'confirmee' && (
                    <Link
                      to={`/payment/${reservation.id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Payer maintenant
                    </Link>
                  )}
                  {reservation.statut === 'en_attente' && (
                    <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                      <MessageSquare size={14} />
                      Contacter
                    </button>
                  )}
                  {reservation.statut === 'terminee' && (
                    <Link
                      to={`/annonces/${reservation.annonceId}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Nouvelle visite
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-16">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">Aucune réservation trouvée</h3>
          <p className="text-gray-500 mb-6">Essayez de modifier vos critères de recherche</p>
          <Link to="/" className="btn-primary">
            Explorer les logements
          </Link>
        </div>
      )}
    </div>
  )
}
