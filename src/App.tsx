import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import Teams from './pages/Teams';
import EquipeA from './pages/EquipeA';
import TeamDetail from './pages/TeamDetail';
import EquipeU19 from './pages/EquipeU19';
import EquipeU17 from './pages/EquipeU17';
import EquipeU15 from './pages/EquipeU15';
import EquipeU12 from './pages/EquipeU12';
import Legends from './pages/Legends';
import History from './pages/History';
import President from './pages/President';
import LegendDetail from './pages/LegendDetail';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Subscriptions from './pages/Subscriptions';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Joueurs from './pages/admin/Joueurs';
import Produits from './pages/admin/Produits';
import ArticlesAdmin from './pages/admin/ArticlesAdmin';
import Parametres from './pages/admin/Parametres';
import LegendesAdmin from './pages/admin/LegendesAdmin';
import HistoireAdmin from './pages/admin/HistoireAdmin';
import CarrouselAdmin from './pages/admin/CarrouselAdmin';
import Commandes from './pages/admin/Commandes';
import Utilisateurs from './pages/admin/Utilisateurs';
import NotFound from './pages/NotFound';
import { CartProvider } from './hooks/useCart';

const InnerApp: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-graphite"><LoadingSpinner /></div>;
  }
  return (
    <CartProvider>
      <div className="min-h-screen bg-graphite">
        {!isAdminRoute && <Header />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<TeamDetail />} />
            <Route path="/equipe-a" element={<EquipeA />} />
            <Route path="/equipe-u19" element={<EquipeU19 />} />
            <Route path="/equipe-u17" element={<EquipeU17 />} />
            <Route path="/equipe-u15" element={<EquipeU15 />} />
            <Route path="/equipe-u12" element={<EquipeU12 />} />
            <Route path="/legends" element={<Legends />} />
            <Route path="/legends/:id" element={<LegendDetail />} />
            <Route path="/histoire" element={<History />} />
            <Route path="/mot-du-president" element={<President />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/commande" element={<Checkout />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            {/*
              Administration.

              Le tableau de bord n'exige qu'un compte de l'administration : il
              s'adapte ensuite au profil. Les rubriques, elles, nomment le droit
              qu'elles demandent — et c'est le serveur qui refuse les écritures,
              pas cette garde.
            */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
            {/* Alias avec faute potentielle 'dashbord' pour tolérance utilisateur */}
            <Route path="/admin/dashbord" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/joueurs" element={<ProtectedRoute permission="players:write"><AdminLayout><Joueurs /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/produits" element={<ProtectedRoute permission="products:write"><AdminLayout><Produits /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/commandes" element={<ProtectedRoute permission="orders:manage"><AdminLayout><Commandes /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/articles" element={<ProtectedRoute permission="articles:write"><AdminLayout><ArticlesAdmin /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/legendes" element={<ProtectedRoute permission="legends:write"><AdminLayout><LegendesAdmin /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/histoire" element={<ProtectedRoute permission="history:write"><AdminLayout><HistoireAdmin /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/carrousel" element={<ProtectedRoute permission="hero:write"><AdminLayout><CarrouselAdmin /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/utilisateurs" element={<ProtectedRoute permission="users:manage"><AdminLayout><Utilisateurs /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/parametres" element={<ProtectedRoute><AdminLayout><Parametres /></AdminLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </CartProvider>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  </Router>
);

export default App;