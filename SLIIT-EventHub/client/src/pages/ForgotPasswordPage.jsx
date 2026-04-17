import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authApi from '../api/authApi';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

// Validation — just needs a valid email
const forgotSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      try {
        await authApi.forgotPassword(values.email);
        setSubmitted(true); // Show success message
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-sm">SLIIT EventHub</span>
          </div>

          {/* Success state — show after email is sent */}
          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center
                              justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                If <span className="font-medium text-gray-700">{formik.values.email}</span> is
                registered, you will receive a password reset link shortly.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Did not receive it? Check your spam folder or try again.
              </p>
              <Button
                variant="secondary"
                size="full"
                onClick={() => setSubmitted(false)}
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and we will send you a reset link
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
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
                <Button type="submit" size="full" isLoading={isLoading} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          {/* Back to sign in */}
          <div className="mt-6 text-center">
            <Link to="/signin"
                  className="text-xs text-gray-500 hover:text-gray-800
                             hover:underline transition-colors flex items-center
                             justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
