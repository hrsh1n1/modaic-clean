/**
 * modaic/frontend/src/App.jsx
 * Root app component with routing
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WardrobePage from './pages/WardrobePage';
import OutfitBuilderPage from './pages/OutfitBuilderPage';
import StylistPage from './pages/StylistPage';
import InsightsPage from './pages/InsightsPage';
import StyleQuizPage from './pages/StyleQuizPage';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — wrapped in AppLayout (sidebar + topbar) */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index             element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wardrobe"  element={<WardrobePage />} />
        <Route path="/builder"   element={<OutfitBuilderPage />} />
        <Route path="/stylist"   element={<StylistPage />} />
        <Route path="/insights"  element={<InsightsPage />} />
        <Route path="/style-quiz" element={<StyleQuizPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
