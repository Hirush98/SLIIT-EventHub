import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SignUpForm from '../components/auth/SignUpForm';

const SignUpPage = () => {
  const navigate        = useNavigate();
  const isAuthenticated = useSelector((s) => s.user.isAuthenticated);

  // If already logged in redirect to home
  useEffect(() => {
    if (isAuthenticated) navigate('/home', { replace: true });
  }, [isAuthenticated, navigate]);

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0
                   11-8 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2">Join SLIIT EventHub</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Create your free account and start exploring
            campus events today.
          </p>

          {/* Password requirements hint */}
          <div className="mt-8 bg-gray-700 rounded-xl p-5 text-left">
            <p className="text-sm font-semibold text-gray-300 mb-3">
              Password requirements
            </p>
            {[
              'At least 8 characters long',
              'One uppercase letter (A-Z)',
              'One lowercase letter (a-z)',
              'One number (0-9)',
              'One special character (@$!%*?&)',
            ].map((rule) => (
              <div key={rule} className="flex items-center gap-2 mb-1.5">
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center
                                justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-gray-300" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-400">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center
                      px-6 py-12 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-800">SLIIT EventHub</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Create your account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details below to get started
            </p>
          </div>

          {/* Form */}
          <SignUpForm />

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
