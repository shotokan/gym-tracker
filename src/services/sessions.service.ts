import { client } from "../api/client";
import { EP } from "../api/endpoints";
import type { WorkoutSession, CreateSessionPayload } from "../types";

export const sessionsService = {
  create: (payload: CreateSessionPayload) =>
    client
      .post<WorkoutSession>(EP.sessions.base, payload)
      .then((r) => r.data)
      .catch((err) => {
        console.error("Error creating session:", {
          status: err.response?.status,
          data: err.response?.data,
          payload,
        });
        throw err;
      }),

  getAll: (limit?: number) =>
    client
      .get<WorkoutSession[]>(EP.sessions.base, {
        params: limit ? { limit } : undefined,
      })
      .then((r) => {
        // El backend devuelve un array directamente, no un objeto con sessions
        return Array.isArray(r.data) ? r.data : [];
      })
      .catch((err) => {
        // Si el backend retorna 404 cuando no hay sesiones, retornar array vacío
        if (err.response?.status === 404) {
          return [];
        }
        throw err;
      }),

  getById: (id: string) =>
    client.get<WorkoutSession>(EP.sessions.byId(id)).then((r) => r.data),
};
