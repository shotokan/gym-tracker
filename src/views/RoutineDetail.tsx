import { useState } from "react";
import type { Plan, GoFn, NavParams } from "../types";
import { Btn, Input, Card } from "../components/ui";
import { uid } from "../utils/helpers";

interface Props {
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  params: NavParams;
  go: GoFn;
}

export default function RoutineDetail({ plans, setPlans, params, go }: Props) {
  const plan = plans.find((p) => p.id === params.planId);
  const routine = plan?.routines.find((r) => r.id === params.routineId);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", sets: "3", reps: "10" });

  if (!plan || !routine) return null;

  const addEx = () => {
    if (!form.name.trim()) return;
    const ex = {
      id: uid(),
      name: form.name.trim(),
      sets: parseInt(form.sets) || 3,
      reps: parseInt(form.reps) || 10,
    };
    setPlans((p) =>
      p.map((x) =>
        x.id === plan.id
          ? {
              ...x,
              routines: x.routines.map((r) =>
                r.id === routine.id
                  ? { ...r, exercises: [...r.exercises, ex] }
                  : r,
              ),
            }
          : x,
      ),
    );
    setForm({ name: "", sets: "3", reps: "10" });
    setShowNew(false);
  };

  const delEx = (eid: string) =>
    setPlans((p) =>
      p.map((x) =>
        x.id === plan.id
          ? {
              ...x,
              routines: x.routines.map((r) =>
                r.id === routine.id
                  ? { ...r, exercises: r.exercises.filter((e) => e.id !== eid) }
                  : r,
              ),
            }
          : x,
      ),
    );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => go("planDetail", { planId: plan.id })}
          className="text-gray-400 text-2xl leading-none"
        >
          ‹
        </button>
        <div>
          <h1 className="text-lg font-bold leading-tight">{routine.name}</h1>
          <p className="text-gray-500 text-sm">{plan.name}</p>
        </div>
      </div>

      <button
        onClick={() => setShowNew(!showNew)}
        className="w-full border-2 border-dashed border-gray-700 text-gray-500 py-3 rounded-2xl text-sm hover:border-violet-500 hover:text-violet-400 transition-colors"
      >
        + Agregar ejercicio
      </button>

      {showNew && (
        <Card className="space-y-3">
          <p className="text-white font-semibold">Nuevo Ejercicio</p>
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nombre del ejercicio"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Series"
              type="number"
              min={1}
              value={form.sets}
              onChange={(e) => setForm((p) => ({ ...p, sets: e.target.value }))}
            />
            <Input
              label="Repeticiones"
              type="number"
              min={1}
              value={form.reps}
              onChange={(e) => setForm((p) => ({ ...p, reps: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Btn onClick={addEx} className="flex-1">
              Agregar
            </Btn>
            <Btn
              onClick={() => setShowNew(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Btn>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {routine.exercises.map((ex, i) => (
          <div
            key={ex.id}
            className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm w-5">{i + 1}</span>
              <div>
                <p className="text-white font-medium">{ex.name}</p>
                <p className="text-gray-500 text-sm">
                  {ex.sets} series × {ex.reps} reps
                </p>
              </div>
            </div>
            <button
              onClick={() => delEx(ex.id)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1"
            >
              ✕
            </button>
          </div>
        ))}
        {routine.exercises.length === 0 && (
          <p className="text-gray-600 text-center py-10 text-sm">
            Sin ejercicios aún.
          </p>
        )}
      </div>
    </div>
  );
}
