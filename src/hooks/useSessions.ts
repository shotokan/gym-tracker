import { useState, useEffect, useCallback } from "react";
import { sessionsService } from "../services/sessions.service";
import type { WorkoutSession, CreateSessionPayload } from "../types";

export function useSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionsService.getAll(limit);
      // Ordenar por fecha descendente (más reciente primero) y luego por created_at
      const sorted = [...data].sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.created_at.localeCompare(a.created_at);
      });
      setSessions(sorted);
    } catch (err) {
      setError("Error al cargar sesiones");
      setSessions([]); // Asegurar que sessions sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions(20);
  }, [fetchSessions]);

  const saveSession = async (
    payload: CreateSessionPayload,
  ): Promise<WorkoutSession> => {
    const session = await sessionsService.create(payload);
    setSessions((prev) => [session, ...(Array.isArray(prev) ? prev : [])]);
    return session;
  };

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    saveSession,
  };
}
