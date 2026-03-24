import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = ({ allowedRoles }) => {
  const { isAuthenticated, currentUser } = useSelector((s) => s.user);

  // Not logged in → redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Role restriction check
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
