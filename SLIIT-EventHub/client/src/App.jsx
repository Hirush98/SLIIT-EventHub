import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppShell from './components/shared/AppShell';
import AuthGuard from './components/shared/AuthGuard';

// Public pages
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import EventCreatePage from './pages/EventCreatePage';
import EventEditPage from './pages/EventEditPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import FeedbackFormPage from './pages/FeedbackFormPage';
import EventFeedbackPage from './pages/EventFeedbackPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Public routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>

          {/* Feedback form for attendees */}
          <Route path="/feedback/:eventId" element={<FeedbackFormPage />} />

          <Route element={<AppShell />}>

            {/* Home */}
            <Route path="/home" element={<HomePage />} />

            {/* Events */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<EventCreatePage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/events/:id/edit" element={<EventEditPage />} />
            <Route path="/events/:eventId/feedback" element={<EventFeedbackPage />} />


            {/* Profile + Settings */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

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

            {/* Organizer + Admin */}
            <Route path="/organizer-dashboard"
              element={
                <AuthGuard allowedRoles={['organizer', 'admin']}>
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
