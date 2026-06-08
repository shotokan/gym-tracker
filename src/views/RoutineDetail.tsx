import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, X } from "lucide-react";
import { usePlan, usePlans } from "../hooks/usePlans";
import type { GoFn, Exercise, Routine } from "../types";

interface Props {
  go: GoFn;
  planId: string;
  routineId: string;
}

// ── Exercise row (inline edit) ────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: Omit<Exercise, "id">;
  onChange: (
    field: keyof Omit<Exercise, "id">,
    value: string | number | null,
  ) => void;
  onDelete: () => void;
}

function ExerciseRow({ exercise, onChange, onDelete }: ExerciseRowProps) {
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
          placeholder="Nombre del ejercicio *"
          value={exercise.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <button
          className="p-2 text-red-400 hover:bg-red-50 rounded-xl shrink-0"
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Series</label>
          <input
            type="number"
            min={1}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-zinc-300"
            value={exercise.sets}
            onChange={(e) => onChange("sets", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Reps</label>
          <input
            type="number"
            min={1}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-zinc-300"
            value={exercise.reps}
            onChange={(e) => onChange("reps", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Peso (kg)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="—"
            value={exercise.weight ?? ""}
            onChange={(e) =>
              onChange("weight", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      </div>

      <input
        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
        placeholder="Notas (opcional)"
        value={exercise.notes ?? ""}
        onChange={(e) => onChange("notes", e.target.value || null)}
      />
    </div>
  );
}

type DraftExercise = Omit<Exercise, "id">;

const emptyExercise = (): DraftExercise => ({
  name: "",
  sets: 3,
  reps: 10,
  weight: null,
  notes: null,
});

// ── Main view ─────────────────────────────────────────────────────────────────

export function RoutineDetailView({ go, planId, routineId }: Props) {
  const { plan, loading, error } = usePlan(planId);
  const { updateRoutine } = usePlans();

  const routine: Routine | undefined = plan?.routines.find(
    (r) => r.id === routineId,
  );

  // Local draft of exercises — saved explicitly by the user
  const [exercises, setExercises] = useState<DraftExercise[]>(
    () => routine?.exercises.map(({ id: _id, ...rest }) => rest) ?? [],
  );
  const [routineName, setRoutineName] = useState(routine?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Sync when routine loads
  if (
    routine &&
    exercises.length === 0 &&
    routine.exercises.length > 0 &&
    !saving
  ) {
    setExercises(routine.exercises.map(({ id: _id, ...rest }) => rest));
    setRoutineName(routine.name);
  }

  const addExercise = () => setExercises((prev) => [...prev, emptyExercise()]);

  const updateExercise = (
    idx: number,
    field: keyof DraftExercise,
    value: string | number | null,
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)),
    );
    setSaved(false);
  };

  const deleteExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
    setSaved(false);
  };

  const handleSave = async () => {
    const invalid = exercises.find((e) => !e.name.trim());
    if (invalid !== undefined) {
      setSaveErr("Todos los ejercicios necesitan un nombre");
      return;
    }

    setSaving(true);
    setSaveErr(null);
    try {
      await updateRoutine(planId, routineId, {
        name: routineName,
        exercises,
      });
      setSaved(true);
    } catch {
      setSaveErr("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
        Cargando…
      </div>
    );
  }

  if (error || !plan || !routine) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-zinc-500 text-sm">
          {error ?? "Rutina no encontrada"}
        </p>
        <button
          className="text-sm text-zinc-900 underline"
          onClick={() => go("planDetail", { planId })}
        >
          Volver al plan
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-zinc-100">
        <button
          className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4"
          onClick={() => go("planDetail", { planId })}
        >
          <ArrowLeft size={16} /> {plan.name}
        </button>

        <div className="flex items-center gap-2">
          <input
            className="flex-1 text-xl font-bold text-zinc-900 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-zinc-300 pb-0.5"
            value={routineName}
            onChange={(e) => {
              setRoutineName(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <p className="text-xs text-zinc-400 mt-1">
          {exercises.length} ejercicio{exercises.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {exercises.length === 0 && (
          <div className="text-center py-10">
            <p className="text-zinc-400 text-sm mb-3">Sin ejercicios aún</p>
          </div>
        )}

        {exercises.map((ex, idx) => (
          <ExerciseRow
            key={idx}
            exercise={ex}
            onChange={(field, val) => updateExercise(idx, field, val)}
            onDelete={() => deleteExercise(idx)}
          />
        ))}

        {/* Add exercise */}
        <button
          className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-200 text-sm text-zinc-400 flex items-center justify-center gap-2 hover:border-zinc-300 hover:text-zinc-500"
          onClick={addExercise}
        >
          <Plus size={16} /> Agregar ejercicio
        </button>
      </div>

      {/* Save bar */}
      <div className="bg-white border-t border-zinc-100 px-4 py-3 space-y-2">
        {saveErr && (
          <div className="flex items-center gap-2 text-xs text-red-500">
            <X size={13} /> {saveErr}
          </div>
        )}
        {saved && (
          <p className="text-xs text-emerald-600 text-center">
            Cambios guardados ✓
          </p>
        )}
        <button
          className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Guardando…" : "Guardar rutina"}
        </button>
      </div>
    </div>
  );
}
