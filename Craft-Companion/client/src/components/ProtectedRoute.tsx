import { Navigate } from 'react-router-dom';

function isLogged() {
  return document.cookie.split(';').some((c) => {
    const [key, value] = c.trim().split('=');
    return key === 'cc_logged_in' && value === 'true';
  });
}

export default function ProtectedRoute({ children }: { children: any }) {
  return isLogged() ? children : <Navigate to="/signin" replace />;
}
