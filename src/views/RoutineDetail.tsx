import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { usePlan, usePlans } from "../hooks/usePlans";
import type {
  GoFn,
  Exercise,
  CreateExercisePayload,
  UpdateExercisePayload,
} from "../types";

interface Props {
  go: GoFn;
  planId: string;
  routineId: string;
}

interface DraftExercise {
  id: string | null;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  saving: boolean;
  error: string | null;
}

const fromExercise = (e: Exercise): DraftExercise => ({
  id: e.id,
  name: e.name,
  sets: e.sets,
  reps: e.reps,
  weight: e.weight,
  notes: e.notes,
  saving: false,
  error: null,
});

const newDraft = (): DraftExercise => ({
  id: null,
  name: "",
  sets: 3,
  reps: 10,
  weight: 0,
  notes: "",
  saving: false,
  error: null,
});

// ── Exercise row ──────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: DraftExercise;
  index: number;
  onChange: (field: keyof DraftExercise, value: string | number) => void;
  onSave: () => void;
  onDelete: () => void;
}

function ExerciseRow({
  exercise,
  index,
  onChange,
  onSave,
  onDelete,
}: ExerciseRowProps) {
  const isNew = !exercise.id;

  return (
    <div
      className={`border rounded-2xl p-4 space-y-3 ${isNew ? "bg-gray-800 border-indigo-500/40" : "bg-gray-800 border-gray-700"}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono w-5 shrink-0">
          {index + 1}.
        </span>
        <input
          className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nombre del ejercicio"
          value={exercise.name}
          onChange={(e) => onChange("name", e.target.value)}
          onBlur={isNew ? undefined : onSave}
        />
        <button
          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {exercise.error && (
        <p className="text-xs text-red-400 pl-7">{exercise.error}</p>
      )}

      <div className="grid grid-cols-3 gap-2 pl-7">
        {(
          [
            { label: "Series", field: "sets" as const, step: 1 },
            { label: "Reps", field: "reps" as const, step: 1 },
            { label: "Peso kg", field: "weight" as const, step: 0.5 },
          ] as const
        ).map((f) => (
          <div key={f.field}>
            <label className="text-xs text-gray-500 mb-1 block">
              {f.label}
            </label>
            <input
              type="number"
              min={0}
              step={f.step}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={
                f.field === "weight" ? exercise.weight || "" : exercise[f.field]
              }
              placeholder="0"
              onChange={(e) => onChange(f.field, Number(e.target.value) || 0)}
              onBlur={isNew ? undefined : onSave}
            />
          </div>
        ))}
      </div>

      <input
        className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ marginLeft: "1.75rem", width: "calc(100% - 1.75rem)" }}
        placeholder="Notas (opcional)"
        value={exercise.notes}
        onChange={(e) => onChange("notes", e.target.value)}
        onBlur={isNew ? undefined : onSave}
      />

      {isNew && (
        <div className="pl-7">
          <button
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            onClick={onSave}
            disabled={exercise.saving || !exercise.name.trim()}
          >
            {exercise.saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Guardando…
              </>
            ) : (
              "Guardar ejercicio"
            )}
          </button>
        </div>
      )}

      {!isNew && exercise.saving && (
        <div className="flex items-center gap-1.5 pl-7">
          <Loader2 size={12} className="animate-spin text-gray-500" />
          <span className="text-xs text-gray-500">Guardando…</span>
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function RoutineDetailView({ go, planId, routineId }: Props) {
  const { plan, setPlan, loading, error } = usePlan(planId);
  const { updateRoutine, createExercise, updateExercise, removeExercise } =
    usePlans();

  const routine = plan?.routines.find((r) => r.id === routineId);

  const [drafts, setDrafts] = useState<DraftExercise[]>([]);
  const [routineName, setRoutineName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (routine && !initialized) {
      setDrafts(routine.exercises.map(fromExercise));
      setRoutineName(routine.name);
      setInitialized(true);
    }
  }, [routine, initialized]);

  const setDraft = (idx: number, patch: Partial<DraftExercise>) =>
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );

  const saveRoutineName = async () => {
    if (!routineName.trim() || routineName === routine?.name) return;
    setNameSaving(true);
    try {
      await updateRoutine(planId, routineId, { name: routineName });
    } finally {
      setNameSaving(false);
    }
  };

  const saveExercise = async (idx: number) => {
    const draft = drafts[idx];
    if (!draft.name.trim() || draft.saving) return;
    setDraft(idx, { saving: true, error: null });
    try {
      if (!draft.id) {
        const payload: CreateExercisePayload = {
          name: draft.name,
          sets: draft.sets,
          reps: draft.reps,
          weight: draft.weight,
          notes: draft.notes,
        };
        const created = await createExercise(planId, routineId, payload);
        setDraft(idx, { id: created.id, saving: false });
      } else {
        const payload: UpdateExercisePayload = {
          name: draft.name,
          sets: draft.sets,
          reps: draft.reps,
          weight: draft.weight,
          notes: draft.notes,
        };
        await updateExercise(planId, routineId, draft.id, payload);
        setDraft(idx, { saving: false });
      }
    } catch {
      setDraft(idx, { saving: false, error: "Error al guardar" });
    }
  };

  const deleteExercise = async (idx: number) => {
    const draft = drafts[idx];
    if (draft.id) {
      try {
        await removeExercise(planId, routineId, draft.id);
        if (plan) {
          setPlan({
            ...plan,
            routines: plan.routines.map((r) =>
              r.id === routineId
                ? {
                    ...r,
                    exercises: r.exercises.filter((e) => e.id !== draft.id),
                  }
                : r,
            ),
          });
        }
      } catch {
        return;
      }
    }
    setDrafts((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando…
      </div>
    );

  if (error || !plan || !routine)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-gray-400 text-sm">
          {error ?? "Rutina no encontrada"}
        </p>
        <button
          className="text-sm text-indigo-400 underline"
          onClick={() => go("planDetail", { planId })}
        >
          Volver al plan
        </button>
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      <button
        className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors"
        onClick={() => go("planDetail", { planId })}
      >
        <ArrowLeft size={16} /> {plan.name}
      </button>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
        <label className="text-xs text-gray-400 mb-2 block">
          Nombre de la rutina
        </label>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            onBlur={saveRoutineName}
          />
          {nameSaving && (
            <Loader2
              size={15}
              className="text-gray-400 animate-spin shrink-0"
            />
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1.5">
          Se guarda al salir del campo
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
          Ejercicios{" "}
          <span className="text-gray-600 font-normal normal-case">
            ({drafts.length})
          </span>
        </h2>

        {drafts.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-6">
            Sin ejercicios — agrégalos abajo
          </p>
        )}

        {drafts.map((ex, idx) => (
          <ExerciseRow
            key={idx}
            index={idx}
            exercise={ex}
            onChange={(field, val) => setDraft(idx, { [field]: val })}
            onSave={() => saveExercise(idx)}
            onDelete={() => deleteExercise(idx)}
          />
        ))}

        <button
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-700 text-sm text-gray-400 flex items-center justify-center gap-2 hover:border-gray-600 hover:text-gray-300 transition-colors"
          onClick={() => setDrafts((prev) => [...prev, newDraft()])}
        >
          <Plus size={16} /> Agregar ejercicio
        </button>
      </div>
    </div>
  );
}
