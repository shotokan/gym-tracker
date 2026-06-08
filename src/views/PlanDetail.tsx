import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Zap,
  Trash2,
  ChevronRight,
  Dumbbell,
  X,
} from "lucide-react";
import { usePlan, usePlans } from "../hooks/usePlans";
import type { GoFn, CreateRoutinePayload } from "../types";

interface Props {
  go: GoFn;
  planId: string;
}

// ── Responsive Modal ──────────────────────────────────────────────────────────
// Mobile  → slides up from bottom (sheet)
// Tablet+ → centered dialog (sm:max-w-md)

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Add routine modal ─────────────────────────────────────────────────────────

interface AddRoutineModalProps {
  planId: string;
  onSave: (planId: string, payload: CreateRoutinePayload) => Promise<unknown>;
  onClose: () => void;
}

function AddRoutineModal({ planId, onSave, onClose }: AddRoutineModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      await onSave(planId, { name: name.trim() });
      onClose();
    } catch {
      setErr("Error al crear la rutina");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Nueva rutina" onClose={onClose}>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input
        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Nombre de la rutina"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        autoFocus
      />
      <div className="flex gap-3 pt-1">
        <button
          className="flex-1 py-3 rounded-xl border border-gray-600 text-sm text-gray-300 font-medium hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Crear rutina"}
        </button>
      </div>
    </Modal>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function PlanDetailView({ go, planId }: Props) {
  const { plan, loading, error } = usePlan(planId);
  const { activatePlan, removePlan, createRoutine, removeRoutine } = usePlans();
  const [showAddRoutine, setShowAddRoutine] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando…
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-gray-400 text-sm">{error ?? "Plan no encontrado"}</p>
        <button
          className="text-sm text-indigo-400 underline"
          onClick={() => go("plans")}
        >
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <button
        className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors"
        onClick={() => go("plans")}
      >
        <ArrowLeft size={16} /> Planes
      </button>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-3">
        <div>
          {plan.active && (
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              Activo
            </span>
          )}
          <h1 className="text-xl font-bold text-white">{plan.name}</h1>
          <p className="text-xs text-gray-500 mt-1">{plan.created_at}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Dumbbell size={11} />
          <span>{(plan.routines ?? []).length} rutinas</span>
        </div>
        <div className="flex gap-2">
          {!plan.active && (
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
              onClick={() => activatePlan(plan.id)}
            >
              <Zap size={13} /> Activar plan
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
            onClick={async () => {
              await removePlan(plan.id);
              go("plans");
            }}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Rutinas</h2>
          <button
            className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={() => setShowAddRoutine(true)}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {(plan.routines ?? []).length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-2xl border border-gray-700">
            <p className="text-gray-400 text-sm mb-3">
              Este plan no tiene rutinas
            </p>
            <button
              className="text-sm font-medium text-indigo-400 underline underline-offset-2"
              onClick={() => setShowAddRoutine(true)}
            >
              Agregar primera rutina
            </button>
          </div>
        ) : (
          (plan.routines ?? []).map((routine) => (
            <div
              key={routine.id}
              className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
            >
              <div
                className="w-full text-left p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() =>
                  go("routineDetail", {
                    planId: plan.id,
                    routineId: routine.id,
                  })
                }
              >
                <p className="font-medium text-white truncate">
                  {routine.name}
                </p>
                <ChevronRight size={16} className="text-gray-600 shrink-0" />
              </div>
              <div className="border-t border-gray-700">
                <button
                  className="w-full py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => removeRoutine(plan.id, routine.id)}
                >
                  Eliminar rutina
                </button>
              </div>
            </div>
          ))
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
