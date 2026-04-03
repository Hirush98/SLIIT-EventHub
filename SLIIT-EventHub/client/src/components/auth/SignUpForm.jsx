import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

// Yup checks each field before the form submits
const signUpSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Must include uppercase, lowercase, number and special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms to continue'),
});

const SignUpForm = () => {
  const { signUp, googleSignIn, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const formik = useFormik({
    initialValues: {
      firstName: '', lastName: '', email: '',
      password: '', confirmPassword: '', acceptTerms: false,
    },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword: _cp, acceptTerms: _at, ...userData } = values;
        await signUp(userData);
        navigate('/home');
      } catch { /* handled in useAuth */ }
    },
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleSignIn(credentialResponse.credential);
      navigate('/home');
    } catch { /* handled in useAuth */ }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <InputField label="First Name" id="firstName" placeholder="John"
            value={formik.values.firstName} onChange={formik.handleChange}
            onBlur={formik.handleBlur} error={formik.errors.firstName}
            touched={formik.touched.firstName} disabled={isLoading} required />
          <InputField label="Last Name" id="lastName" placeholder="Doe"
            value={formik.values.lastName} onChange={formik.handleChange}
            onBlur={formik.handleBlur} error={formik.errors.lastName}
            touched={formik.touched.lastName} disabled={isLoading} required />
        </div>

        <InputField label="Email Address" id="email" type="email" placeholder="you@example.com"
          value={formik.values.email} onChange={formik.handleChange}
          onBlur={formik.handleBlur} error={formik.errors.email}
          touched={formik.touched.email} disabled={isLoading} required />

        <InputField label="Password" id="password" type="password" placeholder="Create a strong password"
          value={formik.values.password} onChange={formik.handleChange}
          onBlur={formik.handleBlur} error={formik.errors.password}
          touched={formik.touched.password} disabled={isLoading} required />

        <InputField label="Confirm Password" id="confirmPassword" type="password" placeholder="Repeat your password"
          value={formik.values.confirmPassword} onChange={formik.handleChange}
          onBlur={formik.handleBlur} error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword} disabled={isLoading} required />

        {/* Terms checkbox */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <input id="acceptTerms" name="acceptTerms" type="checkbox"
              checked={formik.values.acceptTerms} onChange={formik.handleChange}
              onBlur={formik.handleBlur} disabled={isLoading}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-400 cursor-pointer" />
            <label htmlFor="acceptTerms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-gray-800 underline hover:text-gray-600">Terms and Conditions</a>
              {' '}and{' '}
              <a href="#" className="text-gray-800 underline hover:text-gray-600">Privacy Policy</a>
            </label>
          </div>
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <p className="text-xs text-red-500 ml-6">{formik.errors.acceptTerms}</p>
          )}
        </div>

        <Button type="submit" size="full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400">or sign up with</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Google */}
      <div className="flex justify-center w-full">
        <GoogleOAuthProvider clientId={clientId || ''}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {}} width={320} />
        </GoogleOAuthProvider>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/signin" className="text-gray-800 font-semibold hover:underline">Sign in here</Link>
      </p>
    </div>
  );
};

export default SignUpForm;
