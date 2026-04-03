import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const ROLE_STYLES = {
  admin: 'bg-red-100    text-red-700',
  organizer: 'bg-blue-100   text-blue-700',
  participant: 'bg-green-100  text-green-700',
};

const ROLE_DESCRIPTIONS = {
  admin: 'Full platform access. Can approve events and manage users.',
  organizer: 'Can create and manage events. Events require admin approval.',
  participant: 'Can browse and register for approved campus events.',
};

const profileSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Min 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Min 2 characters')
    .required('Last name is required'),
});

const ProfilePage = () => {
  const { currentUser } = useSelector((s) => s.user);
  const { editProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setServerError('');
      setSuccessMsg('');
      try {
        await editProfile(values);
        setSuccessMsg('Profile updated successfully.');
        setIsEditing(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setServerError(err.message || 'Update failed. Please try again.');
      }
    },
  });

  // Helper function
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleCancelEdit = () => {
    formik.resetForm();
    setIsEditing(false);
    setServerError('');
  };

  // Avatar initials
  const initials = `${currentUser?.firstName?.charAt(0) || ''}${currentUser?.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm
                      overflow-hidden">

        {/* Top banner */}
        <div className="h-20 bg-gradient-to-r from-gray-700 to-gray-800" />

        {/* Avatar + name section */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">

            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl border-4 border-white
                            bg-gray-600 flex items-center justify-center
                            shadow-md overflow-hidden flex-shrink-0">
              {currentUser?.profilePhoto ? (
                <img
                  src={currentUser.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {initials || 'U'}
                </span>
              )}
            </div>

            {/* Edit button */}
            {!isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <svg className="w-3.5 h-3.5" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0
                           002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                           15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit Profile
              </Button>
            )}
          </div>

          {/* Success / error messages */}
          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50
                            border border-green-200 text-green-700 text-sm
                            flex items-center gap-2">
              <svg className="w-4 h-4" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {successMsg}
            </div>
          )}
          {serverError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50
                            border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* View mode */}
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  <span>
                    {capitalizeFirstLetter(currentUser?.firstName)}{' '}
                    {capitalizeFirstLetter(currentUser?.lastName)}
                  </span>
                </h2>
                <p className="text-sm text-gray-500">{currentUser?.email}</p>
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                 capitalize
                                 ${ROLE_STYLES[currentUser?.role] ||
                  'bg-gray-100 text-gray-700'}`}>
                  {currentUser?.role}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { label: 'First Name', value: currentUser?.firstName },
                  { label: 'Last Name', value: currentUser?.lastName },
                  { label: 'Email', value: currentUser?.email },
                  {
                    label: 'Role', value: currentUser?.role,
                    extra: ROLE_DESCRIPTIONS[currentUser?.role]
                  },
                ].map(({ label, value, extra }) => (
                  <div key={label}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-400 mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-gray-800 capitalize">
                      {value || '—'}
                    </p>
                    {extra && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {extra}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Edit mode */
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Edit Profile
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.firstName}
                  touched={formik.touched.firstName}
                  disabled={isLoading}
                  required
                />
                <InputField
                  label="Last Name"
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.lastName}
                  touched={formik.touched.lastName}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Email — read only */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-0.5">
                  Email Address
                </p>
                <p className="text-sm text-gray-600">{currentUser?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  size="md"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Security</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Password</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Change your account password
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.href = '/forgot-password'}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-red-600 mb-1">
          Account Information
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Your account is active and in good standing.
          Contact an administrator to deactivate your account.
        </p>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500">
          Role: <span className="font-medium capitalize text-gray-700">
            {currentUser?.role}
          </span>
          <span className="mx-2">·</span>
          Account Status: <span className="font-medium text-green-600">Active</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
