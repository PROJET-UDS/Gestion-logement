import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Annonces from './pages/Annonces'
import AnnonceDetail from './pages/AnnonceDetail'
import Reservations from './pages/Reservations'
import NouvelleReservation from './pages/NouvelleReservation'
import Paiement from './pages/Paiement'
import Messagerie from './pages/Messagerie'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="annonces" element={<Annonces />} />
          <Route path="annonces/:id" element={<AnnonceDetail />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reservations/nouvelle/:id" element={<NouvelleReservation />} />
          <Route path="paiement/:id" element={<Paiement />} />
          <Route path="messagerie" element={<Messagerie />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
