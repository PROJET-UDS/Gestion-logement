import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CreditCard, CheckCircle, ArrowLeft, Lock, AlertCircle, Info } from 'lucide-react'
import { reservations } from '../data/data'

const moyensPaiement = [
  {
    id: 'orange',
    name: 'Orange Money',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    emoji: '📱',
    description: 'Paiement instantané via Orange Money'
  },
  {
    id: 'mtn',
    name: 'MTN MoMo',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    emoji: '📱',
    description: 'Paiement via MTN Mobile Money'
  },
  {
    id: 'wave',
    name: 'Wave',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    emoji: '📱',
    description: 'Paiement rapide avec Wave'
  },
  {
    id: 'cv',
    name: 'Carte Visa',
    color: 'from-gray-700 to-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    emoji: '💳',
    description: 'Paiement sécurisé par carte bancaire'
  }
]

export default function Paiement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedMoyen, setSelectedMoyen] = useState('orange')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [error, setError] = useState('')

  const reservation = reservations.find(r => r.id === parseInt(id)) || {
    titre: 'Réservation',
    localisation: '',
    datevisite: new Date().toISOString(),
    heure: '10:00',
    proprietaire: 'Propriétaire',
    montant: 3000,
    fraisService: 500,
    total: 3500
  }

  const moyenConfig = moyensPaiement.find(m => m.id === selectedMoyen)

  const handlePayment = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Veuillez entrer un numéro de téléphone valide')
      return
    }
    setError('')
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsPaid(true)
    }, 3000)
  }

  const formatPrix = (prix) => new Intl.NumberFormat('fr-CM').format(prix)

  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-black mb-4">Paiement confirmé !</h2>
        <p className="text-gray-600 mb-2">
          Votre réservation est <strong>confirmée</strong>. Le propriétaire a été notifié.
        </p>
        <p className="text-gray-500 mb-8">
          Vous recevrez un SMS de confirmation à votre numéro <strong>{phoneNumber}</strong>
        </p>

        <div className="card bg-green-50 border border-green-200 mb-8 text-left">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Récapitulatif de votre réservation
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Logement</span>
              <span className="font-medium text-black">{reservation.titre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Localisation</span>
              <span className="font-medium text-black">{reservation.localisation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date de visite</span>
              <span className="font-medium text-black">
                {new Date(reservation.datevisite).toLocaleDateString('fr-FR')} à {reservation.heure}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Propriétaire</span>
              <span className="font-medium text-black">{reservation.proprietaire}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="text-gray-600">Montant payé</span>
              <span className="font-bold text-lg text-green-600">{formatPrix(reservation.total)} FCFA</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
            <Info className="text-blue-600" size={18} />
            Prochaine étape
          </h4>
          <p className="text-sm text-gray-600">
            Le propriétaire <strong>{reservation.proprietaire}</strong> vous contactera au <strong>{phoneNumber}</strong> pour confirmer les détails de la visite.
          </p>
        </div>

        <button onClick={() => navigate('/reservations')} className="btn-primary">
          Retour aux réservations
        </button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
        <ArrowLeft size={20} />
        Annuler
      </button>

      <h2 className="text-3xl font-bold text-black mb-2">Paiement sécurisé</h2>
      <p className="text-gray-600 mb-8">Finalisez votre réservation en toute sécurité</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="card mb-6 border-2 border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <CheckCircle className="text-primary" size={20} />
              Récapitulatif
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Logement</span>
                <span className="font-medium text-black">{reservation.titre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date prévue</span>
                <span className="font-medium text-black">
                  {new Date(reservation.datevisite).toLocaleDateString('fr-FR')} à {reservation.heure}
                </span>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de réservation</span>
                  <span className="text-black">{formatPrix(reservation.montant)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de service</span>
                  <span className="text-black">{formatPrix(reservation.fraisService)} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-black">Total à payer</span>
                  <span className="text-primary">{formatPrix(reservation.total)} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
              <Lock size={16} />
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Vos informations sont chiffrées</p>
              <p>• La plateforme ne stocke pas vos coordonnées bancaires</p>
              <p>• Numéro de transaction: <span className="font-mono text-xs">RES-{Date.now()}</span></p>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h3 className="font-semibold text-black mb-4">Mode de paiement</h3>
            <div className="space-y-3">
              {moyensPaiement.map((moyen) => (
                <button
                  key={moyen.id}
                  onClick={() => setSelectedMoyen(moyen.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    selectedMoyen === moyen.id
                      ? `${moyen.borderColor} ${moyen.bgColor}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${moyen.color} rounded-xl flex items-center justify-center text-2xl shadow-sm text-white`}>
                    {moyen.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-black">{moyen.name}</p>
                    <p className="text-xs text-gray-500">{moyen.description}</p>
                  </div>
                  {selectedMoyen === moyen.id && (
                    <div className={`w-6 h-6 rounded-full ${moyen.bgColor} border-2 ${moyen.borderColor} flex items-center justify-center`}>
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="card mb-6">
            <h3 className="font-semibold text-black mb-4">
              Numéro de téléphone <span className="text-red-500">*</span>
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                +237
              </div>
              <input
                type="tel"
                placeholder="6 XX XX XX XX"
                className="input-field pl-16"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                maxLength={9}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Entrez le numéro {selectedMoyen === 'orange' ? 'Orange Money' : selectedMoyen === 'mtn' ? 'MTN MoMo' : selectedMoyen === 'wave' ? 'Wave' : 'associé à votre compte'}
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={!phoneNumber || isProcessing}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              phoneNumber && !isProcessing
                ? 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <Lock size={18} />
                Payer {formatPrix(reservation.total)} FCFA
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Lock size={12} /> Paiement sécurisé SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
