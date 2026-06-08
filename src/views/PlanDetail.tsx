import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Zap,
  Trash2,
  ChevronRight,
  Calendar,
  Clock,
  Dumbbell,
} from "lucide-react";
import { usePlan, usePlans } from "../hooks/usePlans";
import type { GoFn, CreateRoutinePayload } from "../types";

interface Props {
  go: GoFn;
  planId: string;
}

const DAY_OPTIONS = [
  { value: 0, label: "Cualquier día" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

// ── Add routine modal ─────────────────────────────────────────────────────────

interface AddRoutineModalProps {
  planId: string;
  onSave: (planId: string, payload: CreateRoutinePayload) => Promise<unknown>;
  onClose: () => void;
}

function AddRoutineModal({ planId, onSave, onClose }: AddRoutineModalProps) {
  const [name, setName] = useState("");
  const [day, setDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      await onSave(planId, { name: name.trim(), day_of_week: day });
      onClose();
    } catch {
      setErr("Error al crear la rutina");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-800">Nueva rutina</h2>
        {err && <p className="text-sm text-red-500">{err}</p>}

        <input
          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="Nombre de la rutina *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">
            Día de la semana
          </label>
          <select
            className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {DAY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 font-medium"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Crear rutina"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function PlanDetailView({ go, planId }: Props) {
  const { plan, loading, error } = usePlan(planId);
  const { activatePlan, removePlan, createRoutine, removeRoutine } = usePlans();
  const [showAddRoutine, setShowAddRoutine] = useState(false);

  const handleActivate = async () => {
    if (!plan) return;
    try {
      await activatePlan(plan.id);
    } catch {
      /* handled by hook */
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    await removePlan(plan.id);
    go("plans");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
        Cargando…
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-zinc-500 text-sm">{error ?? "Plan no encontrado"}</p>
        <button
          className="text-sm text-zinc-900 underline"
          onClick={() => go("plans")}
        >
          Volver a planes
        </button>
      </div>
    );
  }

  const isActive = plan.status === "active";

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-zinc-100">
        <button
          className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4"
          onClick={() => go("plans")}
        >
          <ArrowLeft size={16} /> Planes
        </button>

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isActive && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Activo
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-zinc-900 truncate">
              {plan.name}
            </h1>
            {plan.description && (
              <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {plan.days_per_week}d / semana
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {plan.duration_weeks} semanas
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell size={13} /> {plan.routines.length} rutinas
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {!isActive && (
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium"
              onClick={handleActivate}
            >
              <Zap size={13} /> Activar plan
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-medium"
            onClick={handleDelete}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      </div>

      {/* Routines */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-700">Rutinas</h2>
          <button
            className="flex items-center gap-1 text-xs font-medium text-zinc-900"
            onClick={() => setShowAddRoutine(true)}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {plan.routines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-sm mb-3">
              Este plan no tiene rutinas
            </p>
            <button
              className="text-sm font-medium text-zinc-900 underline underline-offset-2"
              onClick={() => setShowAddRoutine(true)}
            >
              Agregar primera rutina
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {plan.routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm"
              >
                <button
                  className="w-full text-left p-4 flex items-center justify-between"
                  onClick={() =>
                    go("routineDetail", {
                      planId: plan.id,
                      routineId: routine.id,
                    })
                  }
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-800 truncate">
                      {routine.name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {routine.day_of_week > 0
                        ? DAY_OPTIONS.find(
                            (d) => d.value === routine.day_of_week,
                          )?.label
                        : "Cualquier día"}
                      {" · "}
                      {routine.exercises.length} ejercicios
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300 shrink-0" />
                </button>

                {/* Quick delete */}
                <div className="border-t border-zinc-50">
                  <button
                    className="w-full py-2 text-xs text-red-400 hover:bg-red-50 rounded-b-2xl"
                    onClick={() => removeRoutine(plan.id, routine.id)}
                  >
                    Eliminar rutina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddRoutine && (
        <AddRoutineModal
          planId={plan.id}
          onSave={createRoutine}
          onClose={() => setShowAddRoutine(false)}
        />
      )}
    </div>
  );
}
