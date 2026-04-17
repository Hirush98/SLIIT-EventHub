import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import {
  setLoading,
  setError,
  loginSuccess,
  logoutUser,
  updateUser,
  clearError,
} from '../store/slices/userSlice';

const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { currentUser, isAuthenticated, isLoading, error } =
    useSelector((state) => state.user);

  // ── Sign up ──────────────────────────────────────────────
  const signUp = async (userData) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const res = await authApi.register(userData);
      dispatch(loginSuccess(res.user));
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      dispatch(setError(msg));
      throw new Error(msg);
    }
  };

  // ── Sign in ──────────────────────────────────────────────
  const signIn = async (email, password) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const res = await authApi.login(email, password);
      dispatch(loginSuccess(res.user));
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      dispatch(setError(msg));
      throw new Error(msg);
    }
  };

  // ── Google sign in ───────────────────────────────────────
  const googleSignIn = async (idToken) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const res = await authApi.googleLogin(idToken);
      dispatch(loginSuccess(res.user));
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed.';
      dispatch(setError(msg));
      throw new Error(msg);
    }
  };

  // ── Sign out ─────────────────────────────────────────────
  const signOut = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    dispatch(logoutUser());
    navigate('/signin');
  };

  // ── Update profile ───────────────────────────────────────
  const editProfile = async (profileData) => {
    dispatch(setLoading(true));
    try {
      const res = await authApi.updateProfile(profileData);
      dispatch(updateUser(res.user));
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      dispatch(setError(msg));
      throw new Error(msg);
    }
  };

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    googleSignIn,
    signOut,
    editProfile,
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;
