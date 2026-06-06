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

export default function PlanDetail({ plans, setPlans, params, go }: Props) {
  const plan = plans.find((p) => p.id === params.planId);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");

  if (!plan) return null;

  const create = () => {
    if (!name.trim()) return;
    setPlans((p) =>
      p.map((x) =>
        x.id === plan.id
          ? {
              ...x,
              routines: [
                ...x.routines,
                { id: uid(), name: name.trim(), exercises: [] },
              ],
            }
          : x,
      ),
    );
    setName("");
    setShowNew(false);
  };

  const del = (rid: string) =>
    setPlans((p) =>
      p.map((x) =>
        x.id === plan.id
          ? { ...x, routines: x.routines.filter((r) => r.id !== rid) }
          : x,
      ),
    );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => go("plans")}
          className="text-gray-400 text-2xl leading-none"
        >
          ‹
        </button>
        <div>
          <h1 className="text-xl font-bold">{plan.name}</h1>
          <p className="text-gray-500 text-sm">
            {plan.routines.length} rutinas
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowNew(!showNew)}
        className="w-full border-2 border-dashed border-gray-700 text-gray-500 py-3 rounded-2xl text-sm hover:border-violet-500 hover:text-violet-400 transition-colors"
      >
        + Agregar rutina
      </button>

      {showNew && (
        <Card className="space-y-3">
          <p className="text-white font-semibold">Nueva Rutina</p>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Lunes — Pecho & Tríceps"
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <div className="flex gap-2">
            <Btn onClick={create} className="flex-1">
              Crear
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
        {plan.routines.map((r) => (
          <div key={r.id} className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-semibold">{r.name}</p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {r.exercises.length} ejercicios
                </p>
              </div>
              <button
                onClick={() => del(r.id)}
                className="text-gray-600 hover:text-red-400 transition-colors text-lg p-1"
              >
                ✕
              </button>
            </div>
            <button
              onClick={() =>
                go("routineDetail", { planId: plan.id, routineId: r.id })
              }
              className="mt-2 text-violet-400 text-sm font-medium"
            >
              Ver ejercicios →
            </button>
          </div>
        ))}
        {plan.routines.length === 0 && (
          <p className="text-gray-600 text-center py-10 text-sm">
            Sin rutinas. ¡Agrega la primera!
          </p>
        )}
      </div>
    </div>
  );
}
