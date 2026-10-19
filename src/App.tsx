import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import WardrobePage from '@/pages/wardrobe/WardrobePage';
import AddEditClothingPage from '@/pages/wardrobe/AddEditClothingPage';
import ClothingDetailPage from '@/pages/wardrobe/ClothingDetailPage';
import OutfitBuilderPage from '@/pages/OutfitBuilderPage';
import SavedOutfitsPage from '@/pages/SavedOutfitsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import ColorMatchingPage from '@/pages/ColorMatchingPage';
import VirtualTryOnPage from '@/pages/VirtualTryOnPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wardrobe" element={<WardrobePage />} />
              <Route path="/wardrobe/add" element={<AddEditClothingPage />} />
              <Route path="/wardrobe/:id" element={<ClothingDetailPage />} />
              <Route path="/wardrobe/:id/edit" element={<AddEditClothingPage />} />
              <Route path="/outfit-builder" element={<OutfitBuilderPage />} />
              <Route path="/outfits" element={<SavedOutfitsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/color-matching" element={<ColorMatchingPage />} />
              <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
