import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleGuard from '../components/RoleGuard';
import ShellLayout from '../layouts/ShellLayout';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import UserDashboard from '../pages/UserDashboard';
import TechnicianDashboard from '../pages/TechnicianDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsersPage from '../pages/AdminUsersPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';
import BookingForm from '../features/booking/BookingForm';
import MyBookings from '../features/booking/MyBookings';
import AdminBookings from '../features/booking/AdminBookings';
import BookingCalendar from '../features/booking/BookingCalendar';
import ResourceHeatmap from '../features/booking/ResourceHeatmap';

function inShell(element) {
  return (
    <ProtectedRoute>
      <ShellLayout>{element}</ShellLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/" element={inShell(<HomePage />)} />
          <Route path="/profile" element={inShell(<ProfilePage />)} />
          <Route path="/notifications" element={inShell(<NotificationsPage />)} />
          <Route path="/bookings/calendar" element={inShell(<BookingCalendar />)} />
          <Route path="/bookings/heatmap" element={inShell(<ResourceHeatmap />)} />

          <Route path="/bookings/new" element={inShell(<BookingForm />)} />
          <Route path="/bookings/my" element={inShell(<MyBookings />)} />
          <Route
            path="/admin/bookings"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminBookings />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <ShellLayout>
                  <UserDashboard />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
            path="/technician/dashboard"
            element={
              <RoleGuard allowedRoles={['TECHNICIAN', 'MANAGER', 'ADMIN']}>
                <ShellLayout>
                  <TechnicianDashboard />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
            path="/manager/dashboard"
            element={
              <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                <ShellLayout>
                  <ManagerDashboard />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminDashboard />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminUsersPage />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
