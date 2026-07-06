import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Bed, Bath, Square, Calendar, Filter, Home as HomeIcon, Building2, Warehouse } from 'lucide-react'
import { annonces } from '../data/data'

const typeIcons = {
  villa: HomeIcon,
  appartement: Building2,
  studio: HomeIcon,
  duplex: Building2,
  chambre: HomeIcon,
  commercial: Warehouse
}

export default function Annonces() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtrePrix, setFiltrePrix] = useState('tous')
  const [filtreType, setFiltreType] = useState('tous')
  const [filtreVille, setFiltreVille] = useState('tous')
  const [showFilters, setShowFilters] = useState(false)

  const filteredAnnonces = annonces.filter(a => {
    const matchSearch = a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.localisation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPrix = filtrePrix === 'tous' ||
      (filtrePrix === 'bas' && a.prix < 100000) ||
      (filtrePrix === 'moyen' && a.prix >= 100000 && a.prix < 300000) ||
      (filtrePrix === 'eleve' && a.prix >= 300000)
    const matchType = filtreType === 'tous' || a.type === filtreType
    const matchVille = filtreVille === 'tous' || a.localisation.includes(filtreVille)
    return matchSearch && matchPrix && matchType && matchVille
  })

  const prixFormat = (prix) => new Intl.NumberFormat('fr-CM').format(prix)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Tous les logements</h2>
        <p className="text-gray-600">Explorez {annonces.length} logements disponibles au Cameroun</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, quartier ou ville..."
              className="input-field pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <Filter size={20} />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Ville</label>
              <select className="input-field" value={filtreVille} onChange={(e) => setFiltreVille(e.target.value)}>
                <option value="tous">Toutes les villes</option>
                <option value="Douala">Douala</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Buea">Buea</option>
                <option value="Bafoussam">Bafoussam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
              <select className="input-field" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
                <option value="tous">Tous les types</option>
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="studio">Studio</option>
                <option value="duplex">Duplex</option>
                <option value="chambre">Chambre</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Budget</label>
              <select className="input-field" value={filtrePrix} onChange={(e) => setFiltrePrix(e.target.value)}>
                <option value="tous">Tous les prix</option>
                <option value="bas">Moins de 100.000 FCFA</option>
                <option value="moyen">100.000 - 300.000 FCFA</option>
                <option value="eleve">Plus de 300.000 FCFA</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">{filteredAnnonces.length} résultat{filteredAnnonces.length > 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnonces.map((annonce) => {
          const TypeIcon = typeIcons[annonce.type] || HomeIcon
          return (
            <div key={annonce.id} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img
                  src={annonce.image}
                  alt={annonce.titre}
                  className="w-full h-52 object-cover rounded-lg mb-4"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <TypeIcon size={12} />
                    {annonce.type.charAt(0).toUpperCase() + annonce.type.slice(1)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Disponible
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <MapPin size={14} />
                <span>{annonce.localisation}</span>
              </div>
              <h4 className="font-bold text-black text-lg mb-2 line-clamp-1">{annonce.titre}</h4>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1"><Square size={14} /> {annonce.superficie} m²</span>
                <span className="flex items-center gap-1"><Bed size={14} /> {annonce.chambres} ch.</span>
                <span className="flex items-center gap-1"><Bath size={14} /> {annonce.sallesBain} sdb</span>
              </div>

              <div className="border-t pt-4">
                <p className="text-2xl font-bold text-primary mb-3">{prixFormat(annonce.prix)} <span className="text-sm font-normal text-gray-500">FCFA/mois</span></p>

                <div className="flex gap-2">
                  <Link to={`/annonces/${annonce.id}`} className="btn-primary flex-1 text-center text-sm py-2">
                    Voir détails
                  </Link>
                  <Link to={`/reservations/nouvelle/${annonce.id}`} className="btn-secondary flex-1 text-center text-sm py-2">
                    <Calendar size={16} className="inline mr-1" />
                    Visiter
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAnnonces.length === 0 && (
        <div className="text-center py-16">
          <HomeIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">Aucun résultat</h3>
          <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  )
}
