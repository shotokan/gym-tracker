import { useEffect, useState } from "react";
import type { WorkoutSession, GoFn } from "../types";
import { sessionsService } from "../services/sessions.service";
import { Card, Btn } from "../components/ui";
import { fmtD, fmtTime, fmtDuration } from "../utils/helpers";

interface Props {
  sessionId: string;
  session?: WorkoutSession;
  go: GoFn;
}

export default function SessionDetail({ sessionId, session: initialSession, go }: Props) {
  const [session, setSession] = useState<WorkoutSession | null>(initialSession || null);
  const [loading, setLoading] = useState(!initialSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya tenemos la sesión inicial, no necesitamos hacer fetch
    if (initialSession) {
      setSession(initialSession);
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await sessionsService.getById(sessionId);
        setSession(data);
      } catch (err) {
        setError("Error al cargar la sesión");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, initialSession]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center" style={{ minHeight: "70vh" }}>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <p className="text-red-500">{error || "Sesión no encontrada"}</p>
        <Btn onClick={() => go("dashboard")} variant="secondary">
          Volver al Dashboard
        </Btn>
      </div>
    );
  }

  // Calcular estadísticas
  // Si el backend no envía total_rest_seconds, calcularlo desde los ejercicios
  let totalRestSeconds = session.total_rest_seconds || 0;

  // Fallback: calcular desde los sets si total_rest_seconds no está disponible
  if (totalRestSeconds === 0 && session.exercises) {
    totalRestSeconds = session.exercises.reduce((total, exercise) => {
      if (Array.isArray(exercise.sets)) {
        return total + exercise.sets.reduce((sum, set) => sum + (set.rest_seconds || 0), 0);
      }
      return total;
    }, 0);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <button
          onClick={() => go("dashboard")}
          className="text-gray-500 text-sm mb-2 hover:text-white transition-colors"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">{session.routine_name}</h1>
        <p className="text-gray-500 text-sm">
          {fmtD(session.date)}
        </p>
      </div>

      {/* Horarios de inicio y fin */}
      {session.started_at && session.finished_at && (
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl p-4 border border-violet-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-violet-300 text-xs font-medium">Inicio</p>
                <p className="text-white font-bold text-lg">
                  {fmtTime(session.started_at)}
                </p>
              </div>
            </div>
            <div className="text-violet-400 text-2xl">→</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏁</span>
              <div>
                <p className="text-violet-300 text-xs font-medium">Fin</p>
                <p className="text-white font-bold text-lg">
                  {fmtTime(session.finished_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-violet-300 text-xs font-medium">Duración Total</p>
                <p className="text-white font-bold text-lg">
                  {fmtDuration(session.duration_secs)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <div>
              <p className="text-gray-500 text-xs">Total Series</p>
              <p className="text-white text-2xl font-bold mt-0.5">{session.total_sets}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏸️</span>
            <div>
              <p className="text-gray-500 text-xs">Tiempo de Descanso</p>
              <p className="text-white text-2xl font-bold mt-0.5">
                {totalRestSeconds >= 60 ? (
                  <>
                    {Math.floor(totalRestSeconds / 60)}
                    <span className="text-gray-500 text-sm">m </span>
                    {totalRestSeconds % 60}
                    <span className="text-gray-500 text-sm">s</span>
                  </>
                ) : (
                  <>
                    {totalRestSeconds}
                    <span className="text-gray-500 text-sm"> seg</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <p className="text-gray-400 text-sm font-medium">Ejercicios</p>
        {session.exercises.map((exercise, idx) => (
          <Card key={idx}>
            <p className="text-white font-semibold mb-3">{exercise.name}</p>
            <div className="space-y-2">
              {exercise.sets && Array.isArray(exercise.sets) ? (
                exercise.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="flex justify-between items-center text-sm bg-gray-700/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-400">Serie {setIdx + 1}</span>
                    <div className="flex gap-4 text-gray-300">
                      <span>{set.weight} kg</span>
                      <span>×</span>
                      <span>{set.reps} reps</span>
                      <span className="text-gray-600">·</span>
                      {set.rest_seconds > 0 ? (
                        <span className="text-gray-500">{set.rest_seconds}s descanso previo</span>
                      ) : (
                        <span className="text-gray-600 italic">sin descanso</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  {exercise.sets} series × {exercise.reps} reps @ {exercise.weight} kg
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
