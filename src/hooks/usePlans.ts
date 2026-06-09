import { useState, useEffect, useCallback } from "react";
import { plansService } from "../services/plans.service";
import type {
  Plan,
  Exercise,
  CreatePlanPayload,
  CreateRoutinePayload,
  UpdateRoutinePayload,
  CreateExercisePayload,
  UpdateExercisePayload,
} from "../types";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async (name?: string) => {
    setLoading(true);
    setError(null);
    try {
      setPlans(await plansService.getAll(name));
    } catch {
      setError("Error al cargar planes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ── Plans ──────────────────────────────────────────────────────────────────

  const createPlan = async (payload: CreatePlanPayload): Promise<Plan> => {
    const plan = await plansService.create(payload);
    setPlans((prev) => [...prev, plan]);
    return plan;
  };

  const activatePlan = async (id: string): Promise<void> => {
    await plansService.activate(id);
    setPlans((prev) => prev.map((p) => ({ ...p, active: p.id === id })));
  };

  const removePlan = async (id: string): Promise<void> => {
    await plansService.remove(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Routines ───────────────────────────────────────────────────────────────

  const createRoutine = async (
    planId: string,
    payload: CreateRoutinePayload,
  ) => {
    const routine = await plansService.createRoutine(planId, payload);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, routines: [...(p.routines ?? []), routine] }
          : p,
      ),
    );
    return routine;
  };

  const updateRoutine = async (
    planId: string,
    routineId: string,
    payload: UpdateRoutinePayload,
  ) => {
    const updated = await plansService.updateRoutine(
      planId,
      routineId,
      payload,
    );
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              routines: p.routines.map((r) =>
                r.id === routineId ? { ...r, ...updated } : r,
              ),
            }
          : p,
      ),
    );
    return updated;
  };

  const removeRoutine = async (
    planId: string,
    routineId: string,
  ): Promise<void> => {
    await plansService.removeRoutine(planId, routineId);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, routines: p.routines.filter((r) => r.id !== routineId) }
          : p,
      ),
    );
  };

  // ── Exercises ──────────────────────────────────────────────────────────────

  const updateExercisesInState = (
    planId: string,
    routineId: string,
    exercises: Exercise[],
  ) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              routines: p.routines.map((r) =>
                r.id === routineId ? { ...r, exercises } : r,
              ),
            }
          : p,
      ),
    );
  };

  const createExercise = async (
    planId: string,
    routineId: string,
    payload: CreateExercisePayload,
  ): Promise<Exercise> => {
    const exercise = await plansService.createExercise(
      planId,
      routineId,
      payload,
    );
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              routines: p.routines.map((r) =>
                r.id === routineId
                  ? { ...r, exercises: [...(r.exercises ?? []), exercise] }
                  : r,
              ),
            }
          : p,
      ),
    );
    return exercise;
  };

  const updateExercise = async (
    planId: string,
    routineId: string,
    exerciseId: string,
    payload: UpdateExercisePayload,
  ): Promise<Exercise> => {
    const updated = await plansService.updateExercise(
      planId,
      routineId,
      exerciseId,
      payload,
    );
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              routines: p.routines.map((r) =>
                r.id === routineId
                  ? {
                      ...r,
                      exercises: r.exercises.map((e) =>
                        e.id === exerciseId ? updated : e,
                      ),
                    }
                  : r,
              ),
            }
          : p,
      ),
    );
    return updated;
  };

  const removeExercise = async (
    planId: string,
    routineId: string,
    exerciseId: string,
  ): Promise<void> => {
    await plansService.removeExercise(planId, routineId, exerciseId);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              routines: p.routines.map((r) =>
                r.id === routineId
                  ? {
                      ...r,
                      exercises: r.exercises.filter((e) => e.id !== exerciseId),
                    }
                  : r,
              ),
            }
          : p,
      ),
    );
  };

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    activatePlan,
    removePlan,
    createRoutine,
    updateRoutine,
    removeRoutine,
    createExercise,
    updateExercise,
    removeExercise,
    updateExercisesInState,
  };
}

export function usePlan(planId: string | undefined) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    plansService
      .getById(planId)
      .then(setPlan)
      .catch(() => setError("Error al cargar el plan"))
      .finally(() => setLoading(false));
  }, [planId]);

  return { plan, setPlan, loading, error };
}
