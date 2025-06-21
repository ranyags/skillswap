import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const { isLoggedIn, checkAuth } = useAuth();
  
  // Double-check authentication status
  const authenticated = checkAuth();
  
  return authenticated && isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
