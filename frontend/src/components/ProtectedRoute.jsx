import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const { isAuthReady } = useAuth();
  const { initialize } = useAuth();

  useEffect(() => {
    if (!isAuthReady) {
      initialize();
    }
  }, [initialize, isAuthReady]);

  if (!isAuthReady) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

