import { useState, useEffect } from "react";
import { userService, type UserProfile } from "../services/user.service";
import { getSessionUserID } from "../utils/token";

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = () => {
    const userId = getSessionUserID();
    if (!userId) {
      setError("No se encontró sesión activa.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    userService
      .getProfile(userId)
      .then(setProfile)
      .catch(() => setError("No se pudo cargar el perfil. Intenta de nuevo."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}
