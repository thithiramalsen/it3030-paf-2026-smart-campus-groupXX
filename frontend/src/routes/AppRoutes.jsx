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

import AddResource from '../pages/AddResource';
import EditResource from '../pages/EditResource';
import ResourceDetails from '../pages/ResourceDetails';
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/" element={inShell(<HomePage />)} />
          <Route path="/profile" element={inShell(<ProfilePage />)} />
          <Route path="/notifications" element={inShell(<NotificationsPage />)} />

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
              <RoleGuard allowedRoles={['TECHNICIAN', 'MANAGER', 'ADMIN']}>
                <ShellLayout>
                  <TechnicianDashboard />
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


           
           {/* MANAGER RESOURCE MANAGEMENT */}
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
