import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/auth.store";

export function AuthNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (window.location.pathname !== "/dashboard") {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, navigate]);

  return null;
}
