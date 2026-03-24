import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authApi from '../api/authApi';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const schema = Yup.object({
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
});

const ResetPasswordPage = () => {
  const { token }     = useParams();  // token comes from the URL
  const navigate      = useNavigate();
  const [done, setDone]           = useState(false);
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        await authApi.resetPassword(token, values.password);
        setDone(true);
        // Redirect to signin after 2 seconds
        setTimeout(() => navigate('/signin'), 2000);
      } catch (err) {
        setServerError(
          err.response?.data?.message ||
          'Reset link is invalid or has expired.'
        );
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border
                        border-gray-200 p-8">

          {/* Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center
                          justify-center mb-6">
            <svg className="w-6 h-6 text-gray-600" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0
                       00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7
                       a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>

          {/* Success state */}
          {done ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex
                              items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Password reset!
              </h2>
              <p className="text-sm text-gray-500">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Set new password
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Choose a strong password for your account.
              </p>

              {serverError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50
                                border border-red-200 text-red-700 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={formik.handleSubmit}
                    className="space-y-4" noValidate>
                <InputField
                  label="New Password"
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.password}
                  touched={formik.touched.password}
                  disabled={formik.isSubmitting}
                  required
                />
                <InputField
                  label="Confirm New Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.confirmPassword}
                  touched={formik.touched.confirmPassword}
                  disabled={formik.isSubmitting}
                  required
                />
                <Button
                  type="submit"
                  size="full"
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-gray-500">
                <Link to="/signin"
                      className="text-gray-800 font-semibold hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
