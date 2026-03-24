import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

// ── Validation schema ──────────────────────────────────────
const signInSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// ── Component ──────────────────────────────────────────────
const SignInForm = () => {
  const { signIn, googleSignIn, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: signInSchema,
    onSubmit: async (values) => {
      try {
        await signIn(values.email, values.password);
        navigate('/home');
      } catch {
        // error handled in useAuth hook
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleSignIn(credentialResponse.credential);
      navigate('/home');
    } catch {
      // error handled in useAuth hook
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Server error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg
                        bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
               fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707
                 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293
                 1.293a1 1 0 101.414 1.414L10 11.414l1.293
                 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1
                 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>

        <InputField
          label="Email Address"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.email}
          touched={formik.touched.email}
          disabled={isLoading}
          required
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="text-xs font-medium text-gray-600">
              Password <span className="text-red-500">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-800
                         hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <InputField
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.password}
            touched={formik.touched.password}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          size="full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400">or continue with</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Google */}
      <div className="flex justify-center">
        <GoogleOAuthProvider clientId={clientId || ''}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {}}
            width="100%"
          />
        </GoogleOAuthProvider>
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-xs text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-gray-800 font-semibold hover:underline"
        >
          Create one here
        </Link>
      </p>
    </div>
  );
};

export default SignInForm;
