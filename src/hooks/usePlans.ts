import { useState, useEffect, useCallback } from "react";
import { plansService } from "../services/plans.service";
import type {
  Plan,
  CreatePlanPayload,
  UpdatePlanPayload,
  CreateRoutinePayload,
  UpdateRoutinePayload,
} from "../types";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async (name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansService.getAll(name);
      setPlans(data);
    } catch {
      setError("Error al cargar planes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ── Plan operations ────────────────────────────────────────────────────────

  const createPlan = async (payload: CreatePlanPayload): Promise<Plan> => {
    const plan = await plansService.create(payload);
    setPlans((prev) => [...prev, plan]);
    return plan;
  };

  const updatePlan = async (
    id: string,
    payload: UpdatePlanPayload,
  ): Promise<Plan> => {
    const updated = await plansService.update(id, payload);
    setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const activatePlan = async (id: string): Promise<void> => {
    await plansService.activate(id);
    // Mark all others inactive locally — avoids a full refetch
    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.id === id ? ("active" as const) : ("inactive" as const),
      })),
    );
  };

  const removePlan = async (id: string): Promise<void> => {
    await plansService.remove(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Routine operations ─────────────────────────────────────────────────────

  const createRoutine = async (
    planId: string,
    payload: CreateRoutinePayload,
  ) => {
    const routine = await plansService.createRoutine(planId, payload);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, routines: [...p.routines, routine] } : p,
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
                r.id === routineId ? updated : r,
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

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    activatePlan,
    removePlan,
    createRoutine,
    updateRoutine,
    removeRoutine,
  };
}

// ── Single plan helper ─────────────────────────────────────────────────────────

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

  return { plan, loading, error };
}
