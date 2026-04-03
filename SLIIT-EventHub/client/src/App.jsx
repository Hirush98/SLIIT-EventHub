import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppShell  from './components/shared/AppShell';
import AuthGuard from './components/shared/AuthGuard';

// Public pages
import SignInPage         from './pages/SignInPage';
import SignUpPage         from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';

// Protected pages
import HomePage               from './pages/HomePage';
import EventsPage             from './pages/EventsPage';
import EventDetailPage        from './pages/EventDetailPage';
import EventCreatePage        from './pages/EventCreatePage';
import EventEditPage          from './pages/EventEditPage';
import ProfilePage            from './pages/ProfilePage';
import AdminDashboardPage     from './pages/AdminDashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AnnouncementsPage      from './pages/AnnouncementsPage';
import UserManagementPage     from './pages/UserManagementPage';
import SettingsPage           from './pages/SettingsPage';
import AddMerch               from './components/AddMerch/addMerch.jsx';
import Cart                   from './components/Cart/Cart.jsx';
import Checkout               from './components/Checkout/Checkout.jsx';
import AdminOrders            from './components/AdminOrders/AdminOrders.jsx';
import OrderHistory           from './components/OrderHistory/OrderHistory.jsx';
import Payments               from './components/Payments/Payments.jsx';
import GetMerch               from './components/getMerch/getMerch.jsx';
import ViewMerch              from './components/ViewMerch/ViewMerch.jsx';
import ViewOrder              from './components/ViewOrder/ViewOrder.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Public routes */}
        <Route path="/signin"                element={<SignInPage />} />
        <Route path="/signup"                element={<SignUpPage />} />
        <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>

            {/* Home */}
            <Route path="/home" element={<HomePage />} />

            {/* Events */}
            <Route path="/events"          element={<EventsPage />} />
            <Route path="/events/create"   element={<EventCreatePage />} />
            <Route path="/events/:id"      element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EventEditPage />} />

            {/* Profile + Settings */}
            <Route path="/profile"   element={<ProfilePage />} />
            <Route path="/settings"  element={<SettingsPage />} />

            {/* Announcements */}
            <Route path="/announcements" element={<AnnouncementsPage />} />

            {/* Admin only */}
            <Route path="/admin-dashboard"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </AuthGuard>
              }
            />
            <Route path="/user-management"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <UserManagementPage />
                </AuthGuard>
              }
            />
            <Route path="/payments"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <Payments />
                </AuthGuard>
              }
            />
            <Route path="/admin-orders"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <AdminOrders />
                </AuthGuard>
              }
            />
            <Route path="/merch"
              element={
                <AuthGuard allowedRoles={['admin', 'participant']}>
                  <GetMerch />
                </AuthGuard>
              }
            />
            <Route path="/addmerch"
              element={
                <AuthGuard allowedRoles={['admin']}>
                  <AddMerch />
                </AuthGuard>
              }
            />
            <Route path="/merch/:id"
              element={
                <AuthGuard allowedRoles={['admin', 'participant']}>
                  <ViewMerch />
                </AuthGuard>
              }
            />
            <Route path="/cart"
              element={
                <AuthGuard allowedRoles={['participant']}>
                  <Cart />
                </AuthGuard>
              }
            />
            <Route path="/checkout"
              element={
                <AuthGuard allowedRoles={['participant']}>
                  <Checkout />
                </AuthGuard>
              }
            />
            <Route path="/orders"
              element={
                <AuthGuard allowedRoles={['participant']}>
                  <OrderHistory />
                </AuthGuard>
              }
            />
            <Route path="/orders/view/:orderId"
              element={
                <AuthGuard allowedRoles={['admin', 'participant']}>
                  <ViewOrder />
                </AuthGuard>
              }
            />

            {/* Organizer + Admin */}
            <Route path="/organizer-dashboard"
              element={
                <AuthGuard allowedRoles={['organizer','admin']}>
                  <OrganizerDashboardPage />
                </AuthGuard>
              }
            />
          </Route>
        </Route>

        {/* Catch all → redirect home */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
