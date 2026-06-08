import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { usePlan, usePlans } from "../hooks/usePlans";
import type { GoFn } from "../types";

interface Props {
  go: GoFn;
  planId: string;
  routineId: string;
}

// Exercise exists only as local UI state — not yet persisted in the API
interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
}

const emptyExercise = (): Exercise => ({
  name: "",
  sets: 3,
  reps: 10,
  weight: null,
  notes: null,
});

// ── Exercise row ──────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  onChange: (field: keyof Exercise, value: string | number | null) => void;
  onDelete: () => void;
}

function ExerciseRow({
  exercise,
  index,
  onChange,
  onDelete,
}: ExerciseRowProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono w-5 shrink-0">
          {index + 1}.
        </span>
        <input
          className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nombre del ejercicio"
          value={exercise.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <button
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 pl-7">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Series</label>
          <input
            type="number"
            min={1}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={exercise.sets}
            onChange={(e) => onChange("sets", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Reps</label>
          <input
            type="number"
            min={1}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={exercise.reps}
            onChange={(e) => onChange("reps", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Peso kg</label>
          <input
            type="number"
            min={0}
            step={0.5}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="—"
            value={exercise.weight ?? ""}
            onChange={(e) =>
              onChange("weight", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      </div>

      <input
        className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ marginLeft: "1.75rem", width: "calc(100% - 1.75rem)" }}
        placeholder="Notas (opcional)"
        value={exercise.notes ?? ""}
        onChange={(e) => onChange("notes", e.target.value || null)}
      />
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function RoutineDetailView({ go, planId, routineId }: Props) {
  const { plan, loading, error } = usePlan(planId);
  const { updateRoutine } = usePlans();

  const routine = plan?.routines.find((r) => r.id === routineId);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState(routine?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Sync name when routine loads
  if (routine && !routineName) setRoutineName(routine.name);

  const addExercise = () => {
    setExercises((p) => [...p, emptyExercise()]);
    setSaved(false);
  };
  const deleteExercise = (idx: number) => {
    setExercises((p) => p.filter((_, i) => i !== idx));
    setSaved(false);
  };
  const updateExercise = (
    idx: number,
    field: keyof Exercise,
    value: string | number | null,
  ) => {
    setExercises((p) =>
      p.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)),
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!routineName.trim()) {
      setSaveErr("El nombre es requerido");
      return;
    }
    setSaving(true);
    setSaveErr(null);
    try {
      // API currently only accepts name — exercises will be added in a future backend update
      await updateRoutine(planId, routineId, { name: routineName });
      setSaved(true);
    } catch {
      setSaveErr("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando…
      </div>
    );
  }

  if (error || !plan || !routine) {
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
  }

  return (
    <div className="p-4 space-y-4">
      <button
        className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors"
        onClick={() => go("planDetail", { planId })}
      >
        <ArrowLeft size={16} /> {plan.name}
      </button>

      {/* Routine name */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
        <label className="text-xs text-gray-400 mb-2 block">
          Nombre de la rutina
        </label>
        <input
          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={routineName}
          onChange={(e) => {
            setRoutineName(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      {/* Exercises — local only until API supports them */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">
            Ejercicios{" "}
            <span className="text-gray-500 font-normal">
              ({exercises.length})
            </span>
          </h2>
        </div>

        {exercises.map((ex, idx) => (
          <ExerciseRow
            key={idx}
            index={idx}
            exercise={ex}
            onChange={(field, val) => updateExercise(idx, field, val)}
            onDelete={() => deleteExercise(idx)}
          />
        ))}

        <button
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-700 text-sm text-gray-400 flex items-center justify-center gap-2 hover:border-gray-600 hover:text-gray-300 transition-colors"
          onClick={addExercise}
        >
          <Plus size={16} /> Agregar ejercicio
        </button>
      </div>

      {/* Save */}
      <div className="space-y-2 pt-2">
        {saveErr && (
          <p className="text-xs text-red-400 text-center">{saveErr}</p>
        )}
        {saved && (
          <p className="text-xs text-emerald-400 text-center">
            Cambios guardados ✓
          </p>
        )}
        <button
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
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
