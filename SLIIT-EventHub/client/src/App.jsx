import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout + Guards
import AppShell  from './components/shared/AppShell';
import AuthGuard from './components/shared/AuthGuard';

// Public pages
import SignInPage          from './pages/SignInPage';
import SignUpPage          from './pages/SignUpPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';

// Protected pages
import HomePage         from './pages/HomePage';
import EventsPage       from './pages/EventsPage';
import EventDetailPage  from './pages/EventDetailPage';
import EventCreatePage  from './pages/EventCreatePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Public routes */}
        <Route path="/signin"          element={<SignInPage />} />
        <Route path="/signup"          element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/home"             element={<HomePage />} />
            <Route path="/events"           element={<EventsPage />} />
            <Route path="/events/create"    element={<EventCreatePage />} />
            <Route path="/events/:id"       element={<EventDetailPage />} />
            {/* More routes added as we build them */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
