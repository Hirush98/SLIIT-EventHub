import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SignInForm from '../components/auth/SignInForm';
import { useLocation } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((s) => s.user.isAuthenticated);

  // Get redirect path from query
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirectTo');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo || '/home', { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-800 flex-col
                      justify-center items-center p-12 text-white">
        <div className="max-w-sm text-center">

          {/* Logo */}
          <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center
                          justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-white" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                       a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2">SLIIT EventHub</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your campus event management platform.
            Discover events, register, and stay updated.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              'Browse and register for campus events',
              'Real-time event announcements',
              'QR-based attendance tracking',
              'Event feedback and ratings',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center
                                justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center
                      px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0
                         002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-800">SLIIT EventHub</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <SignInForm />

        </div>
      </div>
    </div>
  );
};

export default SignInPage;
