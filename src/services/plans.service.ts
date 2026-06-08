import { client } from "../api/client";
import { EP } from "../api/endpoints";
import type {
  Plan,
  Routine,
  CreatePlanPayload,
  CreateRoutinePayload,
  UpdateRoutinePayload,
} from "../types";

export const plansService = {
  getAll: (name?: string) =>
    client
      .get<Plan[]>(EP.plans.base, { params: name ? { name } : undefined })
      .then((r) => r.data),

  getById: (id: string) =>
    client.get<Plan>(EP.plans.byId(id)).then((r) => r.data),

  getActive: () => client.get<Plan>(EP.plans.active).then((r) => r.data),

  create: (payload: CreatePlanPayload) =>
    client.post<Plan>(EP.plans.base, payload).then((r) => r.data),

  activate: (id: string) => client.patch(EP.plans.activate(id)),

  remove: (id: string) => client.delete(EP.plans.byId(id)),

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
