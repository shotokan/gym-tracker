import type { Plan, WorkoutSession, BodyMetric, GoFn } from "../types";
import { Card } from "../components/ui";
import { fmtD } from "../utils/helpers";

interface Props {
  activePlan: Plan | null;
  sessions: WorkoutSession[];
  metrics: BodyMetric[];
  go: GoFn;
}

export default function Dashboard({
  activePlan,
  sessions,
  metrics,
  go,
}: Props) {
  const last = sessions[0];
  const lastM = metrics[metrics.length - 1];

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <p className="text-gray-500 text-sm">Bienvenido 👋</p>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg,#6d28d9,#4c1d95)" }}
      >
        <p className="text-violet-300 text-xs font-semibold uppercase tracking-wider">
          Plan Activo
        </p>
        <h2 className="text-white text-lg font-bold mt-1">
          {activePlan?.name ?? "Sin plan activo"}
        </h2>
        {activePlan && (
          <p className="text-violet-300 text-sm">
            {activePlan.routines.length} rutinas
          </p>
        )}
        <button
          onClick={() => go("session")}
          className="mt-3 bg-white text-violet-700 font-bold px-5 py-2 rounded-xl text-sm"
        >
          ▶ Iniciar sesión
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Peso", v: lastM?.weight, u: "kg" },
          { l: "Cintura", v: lastM?.waist, u: "cm" },
        ].map((x) => (
          <Card key={x.l}>
            <p className="text-gray-500 text-xs">{x.l}</p>
            <p className="text-white text-2xl font-bold mt-1">
              {x.v ?? "—"}
              <span className="text-gray-500 text-sm"> {x.u}</span>
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-gray-500 text-xs mb-2">Última sesión</p>
        {last ? (
          <>
            <p className="text-white font-semibold">{last.routineName}</p>
            <p className="text-gray-500 text-sm mt-1">
              {fmtD(last.date)} · {last.exercises.length} ej. ·{" "}
              {last.exercises.reduce((a, e) => a + e.sets.length, 0)} series
            </p>
          </>
        ) : (
          <p className="text-gray-600 text-sm">Sin sesiones aún</p>
        )}
      </Card>

      <div>
        <p className="text-gray-500 text-sm font-medium mb-2">
          Historial reciente
        </p>
        <div className="space-y-2">
          {sessions.slice(0, 5).map((s) => (
            <div
              key={s.id}
              className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center"
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {s.routineName}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {s.exercises.length} ej ·{" "}
                  {s.exercises.reduce((a, e) => a + e.sets.length, 0)} series
                </p>
              </div>
              <p className="text-gray-500 text-xs">{fmtD(s.date)}</p>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-6">
              Sin historial
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
