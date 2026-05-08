import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import HomePage from './pages/HomePage'
import VenueDetailsPage from './pages/VenueDetailsPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/admin/DashboardPage'
import VenueManagementPage from './pages/admin/VenueManagementPage'
import BookingManagementPage from './pages/admin/BookingManagementPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* User-protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/venues/:id" element={<VenueDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin-protected routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/venues" element={<VenueManagementPage />} />
        <Route path="/admin/bookings" element={<BookingManagementPage />} />
      </Route>

      {/* Fallback — redirect unknown paths to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
