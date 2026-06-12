import type { Plan, WorkoutSession, BodyMetric, GoFn } from "../types";
import { Card } from "../components/ui";
import { fmtD, fmtTime, fmtDuration } from "../utils/helpers";

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
  const last = sessions?.[0];
  const lastM = metrics[metrics.length - 1];

  // Determinar la rutina del día basada en la última sesión
  const getNextRoutine = () => {
    if (!activePlan?.routines || activePlan.routines.length === 0) return null;

    if (!last || !last.routine_id) {
      // Si no hay sesiones previas, retornar la primera rutina
      return activePlan.routines[0];
    }

    // Buscar el índice de la última rutina realizada
    const lastRoutineIndex = activePlan.routines.findIndex(
      (r) => r.id === last.routine_id
    );

    if (lastRoutineIndex === -1) {
      // Si la rutina anterior no está en el plan actual, empezar desde el principio
      return activePlan.routines[0];
    }

    // Retornar la siguiente rutina en el ciclo
    const nextIndex = (lastRoutineIndex + 1) % activePlan.routines.length;
    return activePlan.routines[nextIndex];
  };

  const nextRoutine = getNextRoutine();

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
        {activePlan ? (
          <>
            <p className="text-violet-300 text-sm">
              {activePlan.routines.length} rutinas
            </p>
            {nextRoutine && (
              <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">
                  Rutina del día
                </p>
                <p className="text-white font-bold mt-1">{nextRoutine.name}</p>
                <p className="text-violet-300 text-sm mt-1">
                  {nextRoutine.exercises.length} ejercicios
                </p>
              </div>
            )}
            <button
              onClick={() => go("session")}
              className="mt-3 bg-white text-violet-700 font-bold px-5 py-2 rounded-xl text-sm"
            >
              ▶ Iniciar sesión
            </button>
          </>
        ) : (
          <>
            <p className="text-violet-300 text-sm mt-1">
              Crea y activa un plan para comenzar
            </p>
            <button
              onClick={() => go("plans")}
              className="mt-3 bg-white text-violet-700 font-bold px-5 py-2 rounded-xl text-sm"
            >
              → Ir a Planes
            </button>
          </>
        )}
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
            <p className="text-white font-semibold">{last.routine_name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {fmtD(last.date)} · {last.exercises.length} ej. · {last.total_sets}{" "}
              series
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
          {sessions?.slice(0, 5).map((s) => (
            <button
              key={s.id}
              onClick={() => go("sessionDetail", { sessionId: s.id, session: s })}
              className="w-full bg-gray-800 hover:bg-gray-750 transition-colors rounded-xl px-4 py-3 flex justify-between items-center text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {s.routine_name}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {s.exercises.length} ej · {s.total_sets} series · {fmtDuration(s.duration_secs)}
                </p>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <p className="text-gray-400 text-xs">{fmtD(s.date)}</p>
                {s.started_at && fmtTime(s.started_at) ? (
                  <p className="text-gray-600 text-xs mt-0.5">
                    {fmtTime(s.started_at)}
                  </p>
                ) : (
                  fmtTime(s.created_at) && (
                    <p className="text-gray-600 text-xs mt-0.5">
                      {fmtTime(s.created_at)}
                    </p>
                  )
                )}
              </div>
            </button>
          ))}
          {(!sessions || sessions.length === 0) && (
            <p className="text-gray-600 text-sm text-center py-6">
              Sin historial
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
