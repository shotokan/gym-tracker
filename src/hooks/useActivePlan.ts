import { useState, useEffect, useCallback } from "react";
import { plansService } from "../services/plans.service";
import type { Plan } from "../types";

export function useActivePlan() {
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await plansService.getActive();
      setActivePlan(plan);
    } catch (err) {
      setActivePlan(null);
      setError("Error al cargar el plan activo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePlan();
  }, [fetchActivePlan]);

  return { activePlan, loading, error, refetch: fetchActivePlan };
}
