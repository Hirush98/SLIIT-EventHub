import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// AuthGuard — protects routes from non-logged-in users
// Also optionally restricts by role

const AuthGuard = ({ allowedRoles, children }) => {
  const { isAuthenticated, currentUser } = useSelector((s) => s.user);

  // Not logged in → redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Role restriction check
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/home" replace />;
  }

  // If children passed directly (nested usage), render them
  // Otherwise render Outlet (route nesting usage)
  return children ? <>{children}</> : <Outlet />;
};

export default AuthGuard;
