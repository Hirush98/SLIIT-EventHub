import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import SignInPage        from './pages/SignInPage';
import SignUpPage        from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Protected pages
import HomePage          from './pages/HomePage';

// Layout + guard
import AppShell          from './components/shared/AppShell';
import AuthGuard         from './components/shared/AuthGuard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ─────────────────────────────── */}
        {/* Anyone can access these without logging in      */}
        <Route path="/signin"          element={<SignInPage />} />
        <Route path="/signup"          element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Redirect root "/" to signin */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* ── Protected routes ──────────────────────────── */}
        {/* AuthGuard checks login before showing any page  */}
        {/* AppShell provides NavBar + SideNav + Footer      */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>

            {/* Home */}
            <Route path="/home" element={<HomePage />} />

            {/* More routes will be added here as we build:  */}
            {/* /events, /events/create, /events/:id          */}
            {/* /announcements                                 */}
            {/* /profile                                       */}
            {/* /admin                                         */}

          </Route>
        </Route>

        {/* Catch all unknown routes → redirect to signin */}
        <Route path="*" element={<Navigate to="/signin" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
