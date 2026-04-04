import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SmoothScroll from './components/SmoothScroll';
import './styles/tokens.css';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ParcelasPage from './pages/ParcelasPage';
import DetallePage from './pages/DetallePage';
import HistoricoPage from './pages/HistoricoPage';
import RegistroPage from './pages/RegistroPage';
import OnboardingPage from './pages/OnboardingPage';
import AccountPage from './pages/AccountPage';
import EnvironmentPage from './pages/EnvironmentPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/parcelas" element={<ProtectedRoute><ParcelasPage /></ProtectedRoute>} />
          <Route path="/parcela/:id" element={<ProtectedRoute><DetallePage /></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />
          <Route path="/registro" element={<ProtectedRoute><RegistroPage /></ProtectedRoute>} />
          <Route path="/environment" element={<ProtectedRoute><EnvironmentPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        </Routes>
        </SmoothScroll>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
