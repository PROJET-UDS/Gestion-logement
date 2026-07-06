import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Square, Calendar, Phone, Mail, Check, Share2, Heart, ArrowLeft, Home as HomeIcon, User, AlertCircle } from 'lucide-react'
import { annonces } from '../data/data'

export default function AnnonceDetail() {
  const { id } = useParams()
  const [currentImage, setCurrentImage] = useState(0)
  const [liked, setLiked] = useState(false)

  const annonce = annonces.find(a => a.id === parseInt(id))

  if (!annonce) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-black mb-2">Annonce non trouvée</h3>
        <p className="text-gray-500 mb-6">Cette annonce n'existe pas ou a été supprimée.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    )
  }

  const formatPrix = (prix) => new Intl.NumberFormat('fr-CM').format(prix)

  return (
    <div>
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
        <ArrowLeft size={20} />
        Retour aux résultats
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="relative mb-4">
            <img
              src={annonce.images[currentImage]}
              alt={annonce.titre}
              className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
            />
            <button
              onClick={() => setLiked(!liked)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${liked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'}`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button className="absolute top-4 left-4 p-3 rounded-full bg-white/90 text-gray-600 hover:text-primary shadow-lg transition-colors">
              <Share2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {annonce.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-full h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-start gap-2 mb-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {annonce.type.charAt(0).toUpperCase() + annonce.type.slice(1)}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Disponible
            </span>
          </div>

          <h1 className="text-3xl font-bold text-black mb-3">{annonce.titre}</h1>

          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin size={18} />
            <span>{annonce.localisation}</span>
          </div>

          <p className="text-4xl font-bold text-primary mb-2">
            {formatPrix(annonce.prix)} <span className="text-lg font-normal text-gray-500">FCFA/mois</span>
          </p>
          {annonce.charges && <p className="text-sm text-gray-500 mb-6">+ {formatPrix(annonce.charges)} FCFA de charges</p>}

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card text-center py-4">
              <Square className="mx-auto text-primary mb-2" size={24} />
              <p className="text-xl font-bold text-black">{annonce.superficie} m²</p>
              <p className="text-xs text-gray-500">Superficie</p>
            </div>
            <div className="card text-center py-4">
              <Bed className="mx-auto text-primary mb-2" size={24} />
              <p className="text-xl font-bold text-black">{annonce.chambres}</p>
              <p className="text-xs text-gray-500">Chambres</p>
            </div>
            <div className="card text-center py-4">
              <Bath className="mx-auto text-primary mb-2" size={24} />
              <p className="text-xl font-bold text-black">{annonce.sallesBain}</p>
              <p className="text-xs text-gray-500">SdB</p>
            </div>
            {annonce.parking > 0 && (
              <div className="card text-center py-4">
                <HomeIcon className="mx-auto text-primary mb-2" size={24} />
                <p className="text-xl font-bold text-black">{annonce.parking}</p>
                <p className="text-xs text-gray-500">Parking</p>
              </div>
            )}
          </div>

          <div className="card bg-primary/5 border border-primary/20 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="text-primary" size={24} />
              </div>
              <div>
                <p className="font-bold text-black">{annonce.proprietaire.nom}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-yellow-500">★ {annonce.proprietaire.note}</span>
                  <span>({annonce.proprietaire.nbEvaluations} évaluations)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${annonce.proprietaire.telephone}`} className="btn-primary text-sm py-2 text-center flex items-center justify-center gap-2">
                <Phone size={16} />
                Appeler
              </a>
              <a href={`mailto:${annonce.proprietaire.email}`} className="btn-secondary text-sm py-2 text-center flex items-center justify-center gap-2">
                <Mail size={16} />
                Email
              </a>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-amber-800">
                <strong>Conseil:</strong> Contactez le propriétaire entre 8h et 20h pour une réponse plus rapide.
              </p>
            </div>
          </div>

          <Link to={`/reservations/nouvelle/${id}`} className="btn-primary w-full text-center py-4 text-lg">
            <Calendar size={20} className="inline mr-2" />
            Demander une visite
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-black mb-4">Description</h2>
            <div className="text-gray-600 whitespace-pre-line">{annonce.description}</div>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-bold text-black mb-4">Équipements</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {annonce.equipements.map((eq) => (
                <span key={eq} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Check size={16} className="text-green-500" />
                  {eq}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-black mb-4">Le quartier</h2>
            <p className="text-gray-600 mb-4">{annonce.quartier.description}</p>
            <h3 className="font-semibold text-black mb-2">À proximité</h3>
            <div className="space-y-2">
              {annonce.quartier.pointsInteret.map((point) => (
                <div key={point} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-black mb-4">Sécurité</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={18} className="text-green-600" />
                </div>
                <span className="text-gray-700">Gardien 24h/24</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={18} className="text-green-600" />
                </div>
                <span className="text-gray-700">Quartier surveillé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
