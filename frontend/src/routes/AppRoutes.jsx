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
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';

import BookingForm from '../features/booking/BookingForm';
import MyBookings from '../features/booking/MyBookings';
import AdminBookings from '../features/booking/AdminBookings';
import BookingCalendar from '../features/booking/BookingCalendar';
import ResourceHeatmap from '../features/booking/ResourceHeatmap';

import MyTicket from '../features/tickets/MyTicket';
import NewTicket from '../features/tickets/NewTicket';
import AdminTickets from '../features/tickets/AdminTickets';
import AdminReplyTickets from '../features/tickets/AdminReplyTickets';
import TicketDetails from '../features/tickets/TicketDetails';
import AssignedTickets from '../features/tickets/AssignedTickets';

import AddResource from '../pages/AddResource';
import EditResource from '../pages/EditResource';
import ResourceDetails from '../pages/ResourceDetails';
import ResourceManagement from '../pages/ResourceManagement';
import UserResourcesPage from '../pages/UserResourcesPage';
import UserResourceDetail from '../pages/UserResourceDetail';

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

          {/* PUBLIC */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

          {/* COMMON */}
          <Route path="/" element={inShell(<HomePage />)} />
          <Route path="/profile" element={inShell(<ProfilePage />)} />
          <Route path="/notifications" element={inShell(<NotificationsPage />)} />

          {/* BOOKINGS */}
          <Route path="/bookings/new" element={inShell(<BookingForm />)} />
          <Route path="/bookings/my" element={inShell(<MyBookings />)} />
          <Route path="/bookings/calendar" element={inShell(<BookingCalendar />)} />
          <Route path="/bookings/heatmap" element={inShell(<ResourceHeatmap />)} />

          {/* TICKETS (USER) */}
          <Route path="/tickets/new" element={inShell(<NewTicket />)} />
          <Route path="/tickets/my" element={inShell(<MyTicket />)} />
          <Route path="/tickets/:id" element={inShell(<TicketDetails />)} />

          {/* ADMIN BOOKINGS */}
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

          {/* DASHBOARDS */}
          {/* USER dashboard */}
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


           {/* RESOURCES – USER VIEW */}
          <Route path="/resources" element={inShell(<UserResourcesPage />)} />
          <Route path="/resources/:id" element={inShell(<UserResourceDetail />)} />



           {/* TECHNICIAN DASHBOARD */}
          <Route
            path="/technician/dashboard"
            element={
              <RoleGuard allowedRoles={['TECHNICIAN', 'ADMIN']}>
                <ShellLayout>
                  <TechnicianDashboard />
                </ShellLayout>
              </RoleGuard>
            }
          />
          <Route
            path="/technician/tickets"
            element={
              <RoleGuard allowedRoles={['TECHNICIAN']}>
                <ShellLayout>
                  <AssignedTickets />
                </ShellLayout>
              </RoleGuard>
            }
          />
           {/* MANAGER DASHBOARD */}
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

          {/* ADMIN */}

           
           {/* MANAGER RESOURCE MANAGEMENT */}
          <Route
            path="/manager/resources"
            element={
              <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                <ShellLayout>
                  <ResourceManagement />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
             path="/manager/resources/add"
             element={
              <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                <ShellLayout>
                    <AddResource />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
             path="/manager/resources/edit/:id"
             element={
              <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                 <ShellLayout>
                     <EditResource />
                 </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
             path="/manager/resources/:id"
             element={
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <ShellLayout>
                     <ResourceDetails />
                  </ShellLayout>
                </RoleGuard>
            }
          />


            {/* Admin routes */}
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

          <Route
            path="/admin/analytics"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminAnalyticsPage />
                </ShellLayout>
              </RoleGuard>
            }
          />

          {/* ADMIN TICKETS */}
          <Route
            path="/admin/tickets"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminTickets />
                </ShellLayout>
              </RoleGuard>
            }
          />

          <Route
            path="/admin/tickets/reply"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminReplyTickets />
                </ShellLayout>
              </RoleGuard>
            }
          />

          {/* 🔥🔥🔥 YOUR ADDED PART (DO NOT REMOVE) */}
          <Route
            path="/admin/tickets/:id"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <ShellLayout>
                  <AdminReplyTickets />
                </ShellLayout>
              </RoleGuard>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}