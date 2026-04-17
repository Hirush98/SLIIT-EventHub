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
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>

            <Route path="/home" element={<HomePage />} />

            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<EventCreatePage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EventEditPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="/announcements" element={<AnnouncementsPage />} />

            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/admin-orders" element={<AdminOrders />} />

            <Route path="/merch" element={<GetMerch />} />
            <Route path="/addmerch" element={<AddMerch />} />
            <Route path="/merch/:id" element={<ViewMerch />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/view/:orderId" element={<ViewOrder />} />

            <Route path="/organizer-dashboard" element={<OrganizerDashboardPage />} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;