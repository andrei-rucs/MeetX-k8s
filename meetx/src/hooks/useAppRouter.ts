import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useAppRouter = () => {
  const navigate = useNavigate();

  const redirectToHome = useCallback(
    () => navigate("/dashboard"),
    [navigate]
  );

  const redirectToHomePage = useCallback(
    () => navigate("/"),
    [navigate]
  );

  const redirectToLogin = useCallback(
    () => {
      const authUrl = import.meta.env.VITE_AUTH_URL;
      window.location.replace(`${authUrl}/login`);
    },
    []
  );

  const redirectToRegister = useCallback(
    () => {
      const authUrl = import.meta.env.VITE_AUTH_URL;
      window.location.replace(`${authUrl}/register`);
    },
    []
  );

  return {
    redirectToHome,
    redirectToLogin,
    navigate,
    redirectToRegister,
    redirectToHomePage
  };
};
