import { client } from "../api/client";
import { EP } from "../api/endpoints";
import type {
  Plan,
  Routine,
  CreatePlanPayload,
  UpdatePlanPayload,
  CreateRoutinePayload,
  UpdateRoutinePayload,
} from "../types";

export const plansService = {
  // ── Plans ──────────────────────────────────────────────────────────────────

  getAll: (name?: string) => {
    const params = name ? { name } : undefined;
    return client.get<Plan[]>(EP.plans.base, { params }).then((r) => r.data);
  },

  getActive: () => client.get<Plan>(EP.plans.active).then((r) => r.data),

  getById: (id: string) =>
    client.get<Plan>(EP.plans.byId(id)).then((r) => r.data),

  create: (payload: CreatePlanPayload) =>
    client.post<Plan>(EP.plans.base, payload).then((r) => r.data),

  update: (id: string, payload: UpdatePlanPayload) =>
    client.patch<Plan>(EP.plans.byId(id), payload).then((r) => r.data),

  activate: (id: string) =>
    client.patch<Plan>(EP.plans.activate(id)).then((r) => r.data),

  remove: (id: string) => client.delete(EP.plans.byId(id)),

  // ── Routines ───────────────────────────────────────────────────────────────

  createRoutine: (planId: string, payload: CreateRoutinePayload) =>
    client
      .post<Routine>(EP.plans.routines(planId), payload)
      .then((r) => r.data),

  updateRoutine: (
    planId: string,
    routineId: string,
    payload: UpdateRoutinePayload,
  ) =>
    client
      .patch<Routine>(EP.plans.routine(planId, routineId), payload)
      .then((r) => r.data),

  removeRoutine: (planId: string, routineId: string) =>
    client.delete(EP.plans.routine(planId, routineId)),
};
