import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    const id = user.college?._id || user.college;
    if (id) return <Navigate to={`/college/${id}`} replace />;
    return <Navigate to="/profile/setup" replace />;
  }
  return children;
}
