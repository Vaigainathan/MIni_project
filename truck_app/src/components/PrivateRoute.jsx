import { Navigate } from 'react-router-dom';
import { getToken, getUserRole } from '../utils/auth';
import '../styles/Dashboard.css'

function PrivateRoute({ children, roles }) {
  const token = getToken();
  const role = getUserRole();

  if (!token) return <Navigate to="/login" />;
  if (!roles.includes(role)) return <Navigate to="/unauthorized" />;
  return children;
}

export default PrivateRoute;



