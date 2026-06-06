import { useState } from "react";
import type { Plan, GoFn } from "../types";
import { Btn, Input, Card } from "../components/ui";
import { uid } from "../utils/helpers";

interface Props {
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  go: GoFn;
}

export default function Plans({ plans, setPlans, go }: Props) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");

  const create = () => {
    if (!name.trim()) return;
    setPlans((p) => [
      ...p,
      { id: uid(), name: name.trim(), active: false, routines: [] },
    ]);
    setName("");
    setShowNew(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Planes</h1>
        <Btn onClick={() => setShowNew(!showNew)}>+ Nuevo</Btn>
      </div>

      {showNew && (
        <Card className="space-y-3">
          <p className="text-white font-semibold">Nuevo Plan</p>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mes 2 — Fuerza"
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

      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-4 border-2 ${plan.active ? "border-violet-500" : "border-transparent bg-gray-800"}`}
            style={
              plan.active ? { background: "rgba(124,58,237,0.1)" } : undefined
            }
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold">{plan.name}</h3>
              {plan.active && (
                <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">
                  Activo
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {plan.routines.length} rutinas
            </p>
            <div className="flex gap-2">
              <Btn
                onClick={() => go("planDetail", { planId: plan.id })}
                variant="secondary"
                className="flex-1"
              >
                Ver rutinas
              </Btn>
              {!plan.active && (
                <Btn
                  onClick={() =>
                    setPlans((p) =>
                      p.map((x) => ({ ...x, active: x.id === plan.id })),
                    )
                  }
                  className="flex-1"
                >
                  Activar
                </Btn>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
