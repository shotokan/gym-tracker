import { useState } from "react";
import { ArrowLeft, Plus, Zap, Trash2, ChevronRight, X } from "lucide-react";
import { usePlan, usePlans } from "../hooks/usePlans";
import type { GoFn, CreateRoutinePayload } from "../types";

interface Props {
  go: GoFn;
  planId: string;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Add routine modal ─────────────────────────────────────────────────────────

function AddRoutineModal({
  planId,
  onSave,
  onClose,
}: {
  planId: string;
  onSave: (planId: string, payload: CreateRoutinePayload) => Promise<unknown>;
  onClose: () => void;
}) {
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
        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Ej. Lunes — Pecho y Tríceps"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        autoFocus
      />
      <div className="flex gap-3">
        <button
          className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Crear"}
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

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando…
      </div>
    );

  if (error || !plan)
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

  const routines = plan.routines ?? [];

  return (
    <div className="p-4 space-y-5">
      {/* Back */}
      <button
        className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors"
        onClick={() => go("plans")}
      >
        <ArrowLeft size={15} /> Planes
      </button>

      {/* Plan header card */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-3">
        {/* Name + actions row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white leading-tight truncate">
              {plan.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{plan.created_at}</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-500">
                {routines.length} {routines.length === 1 ? "rutina" : "rutinas"}
              </span>
              {plan.active && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Activo
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Icon actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!plan.active && (
              <button
                title="Activar plan"
                className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                onClick={() => activatePlan(plan.id)}
              >
                <Zap size={15} />
              </button>
            )}
            <button
              title="Eliminar plan"
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={async () => {
                await removePlan(plan.id);
                go("plans");
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Routines section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Rutinas
          </h2>
          <button
            className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={() => setShowAddRoutine(true)}
          >
            <Plus size={13} /> Agregar
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-10 bg-gray-800 rounded-2xl border border-gray-700 border-dashed">
            <p className="text-gray-500 text-sm mb-3">Sin rutinas aún</p>
            <button
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              onClick={() => setShowAddRoutine(true)}
            >
              Agregar primera rutina
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 divide-y divide-gray-700/60 overflow-hidden">
            {routines.map((routine, idx) => (
              <div
                key={routine.id}
                className="flex items-center gap-3 px-4 py-3 group hover:bg-gray-700/30 transition-colors"
              >
                {/* Index */}
                <span className="text-xs font-mono text-gray-600 w-4 shrink-0">
                  {idx + 1}
                </span>

                {/* Name → navigate */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    go("routineDetail", {
                      planId: plan.id,
                      routineId: routine.id,
                    })
                  }
                >
                  <p className="text-sm font-medium text-white truncate">
                    {routine.name}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all"
                    onClick={() => removeRoutine(plan.id, routine.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                  <div
                    className="p-1.5 cursor-pointer"
                    onClick={() =>
                      go("routineDetail", {
                        planId: plan.id,
                        routineId: routine.id,
                      })
                    }
                  >
                    <ChevronRight size={15} className="text-gray-600" />
                  </div>
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
