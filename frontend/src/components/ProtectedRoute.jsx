import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, requireCollege = true }) {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (requireCollege && !user.college) return <Navigate to="/profile/setup" replace />;
  return children;
}
