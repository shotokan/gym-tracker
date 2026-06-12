import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";

interface UseAuthReturn {
  isAuth: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cambios en sessionStorage (cuando el interceptor elimina el token)
  useEffect(() => {
    const checkToken = () => {
      const currentToken = sessionStorage.getItem("token");
      setToken(currentToken);
    };

    // Verificar cada segundo si el token sigue existiendo
    const interval = setInterval(checkToken, 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({ email, password });
      sessionStorage.setItem("token", data.token);
      setToken(data.token);
      return true;
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } }).response
        ?.status;

      if (status === 401) {
        setError("Email o contraseña incorrectos.");
      } else if (!status) {
        setError("No se pudo conectar al servidor. Verifica tu conexión.");
      } else {
        setError("Error del servidor. Intenta de nuevo.");
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
  };

  return { isAuth: !!token, loading, error, login, logout };
}
