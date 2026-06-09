import { client } from "../api/client";
import { EP } from "../api/endpoints";
import type {
  Plan,
  Routine,
  Exercise,
  CreatePlanPayload,
  UpdatePlanPayload,
  CreateRoutinePayload,
  UpdateRoutinePayload,
  CreateExercisePayload,
  UpdateExercisePayload,
} from "../types";

export const plansService = {
  // ── Plans ──────────────────────────────────────────────────────────────────
  getAll: (name?: string) =>
    client
      .get<Plan[]>(EP.plans.base, { params: name ? { name } : undefined })
      .then((r) => r.data),
  getById: (id: string) =>
    client.get<Plan>(EP.plans.byId(id)).then((r) => r.data),
  getActive: () => client.get<Plan>(EP.plans.active).then((r) => r.data),
  create: (payload: CreatePlanPayload) =>
    client.post<Plan>(EP.plans.base, payload).then((r) => r.data),
  update: (id: string, payload: UpdatePlanPayload) =>
    client.patch<Plan>(EP.plans.byId(id), payload).then((r) => r.data),
  activate: (id: string) => client.patch(EP.plans.activate(id)),
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

  // ── Exercises ──────────────────────────────────────────────────────────────
  listExercises: (planId: string, routineId: string) =>
    client
      .get<Exercise[]>(EP.plans.exercises(planId, routineId))
      .then((r) => r.data),
  createExercise: (
    planId: string,
    routineId: string,
    payload: CreateExercisePayload,
  ) =>
    client
      .post<Exercise>(EP.plans.exercises(planId, routineId), payload)
      .then((r) => r.data),
  updateExercise: (
    planId: string,
    routineId: string,
    exerciseId: string,
    payload: UpdateExercisePayload,
  ) =>
    client
      .patch<Exercise>(
        EP.plans.exercise(planId, routineId, exerciseId),
        payload,
      )
      .then((r) => r.data),
  removeExercise: (planId: string, routineId: string, exerciseId: string) =>
    client.delete(EP.plans.exercise(planId, routineId, exerciseId)),
};
