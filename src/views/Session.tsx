import { useState, useEffect, useRef } from "react";
import type { Plan, GoFn, CreateSessionPayload } from "../types";
import { Card, Btn, ProgressBar } from "../components/ui";

interface LocalExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface LocalRoutine {
  id: string;
  name: string;
  exercises: LocalExercise[];
}

interface CompletedSetData {
  weight: number;
  reps: number;
  rest_seconds: number;
}

interface ExerciseData {
  name: string;
  exercise_id: string;
  completedSets: CompletedSetData[];
}

type Phase = "select" | "workout" | "rest" | "done";

interface Props {
  activePlan: Plan | null;
  saveSession: (payload: CreateSessionPayload) => Promise<unknown>;
  go: GoFn;
}

export default function Session({ activePlan, saveSession, go }: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [routine, setRoutine] = useState<LocalRoutine | null>(null);
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [wt, setWt] = useState("");
  const [rp, setRp] = useState("");
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [restDur, setRestDur] = useState(60);
  const [left, setLeft] = useState(0);
  const [completedSetsCount, setCompletedSetsCount] = useState(0);
  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justEnteredRest = useRef(false);
  const startedAt = useRef<number>(0);
  const startedAtISO = useRef<string>("");
  const restStartedAt = useRef<number>(0);
  const restExIdx = useRef<number>(0);
  const restSetIdx = useRef<number>(0);
  const sessionSaved = useRef(false);
  const lastRestSeconds = useRef<number>(0); // Guarda el descanso anterior para asignarlo a la siguiente serie

  const ex = routine?.exercises[exIdx];
  const totalSets = routine?.exercises.reduce((a, e) => a + e.sets, 0) ?? 1;

  // Pre-fill weight and reps from exercise data
  useEffect(() => {
    if (!ex) return;
    setRp(String(ex.reps));
    const lw = ex.weight > 0 ? String(ex.weight) : "";
    setWt(lw);
  }, [exIdx, routine?.id]);

  useEffect(() => {
    if (phase === "rest" && restStartedAt.current === 0) {
      setLeft(restDur);
      justEnteredRest.current = true;
      restStartedAt.current = Date.now();
    }
  }, [phase, restDur]);

  // Manejar cambio de restDur mientras ya estamos en descanso
  useEffect(() => {
    if (phase === "rest" && restStartedAt.current > 0) {
      const elapsed = Math.floor((Date.now() - restStartedAt.current) / 1000);
      const newLeft = Math.max(0, restDur - elapsed);
      setLeft(newLeft);
    }
  }, [restDur, phase]);

  useEffect(() => {
    if (phase !== "rest") {
      // Cuando salimos de rest, resetear el flag
      justEnteredRest.current = false;
      return;
    }

    // Si acabamos de entrar a rest, esperar el siguiente ciclo
    if (justEnteredRest.current) {
      justEnteredRest.current = false;
      return;
    }

    if (left > 0) {
      tmr.current = setTimeout(() => setLeft((l) => l - 1), 1000);
    } else {
      saveRestTime();
      setPhase("workout");
    }
    return () => {
      if (tmr.current) clearTimeout(tmr.current);
    };
  }, [phase, left]);

  // Map API routines → LocalRoutine using real exercises from API
  const localRoutines: LocalRoutine[] = (activePlan?.routines ?? []).map(
    (r) => ({
      id: r.id,
      name: r.name,
      exercises: (r.exercises ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
      })),
    }),
  );

  const completeSet = () => {
    if (!ex || !routine) return;

    const currentWeight = parseFloat(wt) || 0;
    const currentReps = parseInt(rp) || 0;

    console.log("completeSet called", {
      exIdx,
      setIdx,
      exerciseName: ex.name,
      weight: currentWeight,
      reps: currentReps,
      lastRestSeconds: lastRestSeconds.current,
    });

    setCompletedSetsCount((prev) => prev + 1);

    const nsi = setIdx + 1;
    const lastSet = nsi >= ex.sets;
    const nei = exIdx + 1;
    const lastEx = nei >= routine.exercises.length;

    if (!lastSet) {
      // No es la última serie del ejercicio - guardar serie con el descanso ANTERIOR y pasar al descanso
      setExerciseData((prev) => {
        const updated = [...prev];
        if (!updated[exIdx]) {
          updated[exIdx] = {
            name: ex.name,
            exercise_id: ex.id,
            completedSets: [],
          };
        }

        console.log("Before push - completedSets length:", updated[exIdx].completedSets.length);

        updated[exIdx] = {
          ...updated[exIdx],
          completedSets: [
            ...updated[exIdx].completedSets,
            {
              weight: currentWeight,
              reps: currentReps,
              rest_seconds: lastRestSeconds.current, // Descanso que tomaste ANTES de esta serie
            },
          ],
        };

        console.log("After push - completedSets length:", updated[exIdx].completedSets.length);

        return updated;
      });

      restExIdx.current = exIdx;
      restSetIdx.current = setIdx;
      setSetIdx(nsi);
      setPhase("rest");
    } else if (!lastEx) {
      // Última serie del ejercicio pero no es el último ejercicio
      setExerciseData((prev) => {
        const updated = [...prev];
        if (!updated[exIdx]) {
          updated[exIdx] = {
            name: ex.name,
            exercise_id: ex.id,
            completedSets: [],
          };
        }

        updated[exIdx] = {
          ...updated[exIdx],
          completedSets: [
            ...updated[exIdx].completedSets,
            {
              weight: currentWeight,
              reps: currentReps,
              rest_seconds: lastRestSeconds.current, // Descanso que tomaste ANTES de esta serie
            },
          ],
        };

        return updated;
      });

      restExIdx.current = exIdx;
      restSetIdx.current = setIdx;
      setExIdx(nei);
      setSetIdx(0);
      setPhase("rest");
    } else {
      // Última serie del último ejercicio - sesión completada
      setExerciseData((prev) => {
        const updated = [...prev];
        if (!updated[exIdx]) {
          updated[exIdx] = {
            name: ex.name,
            exercise_id: ex.id,
            completedSets: [],
          };
        }

        // Agregar la última serie completada con el descanso ANTERIOR
        updated[exIdx] = {
          ...updated[exIdx],
          completedSets: [
            ...updated[exIdx].completedSets,
            {
              weight: currentWeight,
              reps: currentReps,
              rest_seconds: lastRestSeconds.current, // Descanso que tomaste ANTES de esta serie
            },
          ],
        };

        // Construir payload con todos los datos actualizados
        const finishedAtISO = new Date().toISOString();
        const durationSecs = Math.floor((Date.now() - startedAt.current) / 1000);

        console.log("Session completed - exerciseData:", updated);

        const payload: CreateSessionPayload = {
          plan_id: activePlan?.id,
          routine_id: routine.id,
          routine_name: routine.name,
          date: new Date().toISOString().split("T")[0],
          duration_secs: durationSecs,
          started_at: startedAtISO.current,
          finished_at: finishedAtISO,
          exercises: updated
            .filter((ex) => ex && ex.completedSets.length > 0)
            .map((ex) => ({
              exercise_id: ex.exercise_id,
              name: ex.name,
              sets: ex.completedSets,
            })),
        };

        console.log("Final payload:", JSON.stringify(payload, null, 2));

        // Guardar sesión (fire-and-forget con error handling)
        // Prevenir guardado duplicado debido a React Strict Mode
        if (!sessionSaved.current) {
          sessionSaved.current = true;
          saveSession(payload).catch((err) =>
            console.error("Failed to save session:", err),
          );
        }

        return updated;
      });

      setPhase("done");
    }
  };

  const saveRestTime = () => {
    if (restStartedAt.current === 0) return;
    const actualRestSeconds = Math.floor((Date.now() - restStartedAt.current) / 1000);

    console.log("saveRestTime called", {
      actualRestSeconds,
    });

    // Guardar el tiempo de descanso para asignarlo a la SIGUIENTE serie
    lastRestSeconds.current = actualRestSeconds;

    restStartedAt.current = 0;
  };

  const reset = () => {
    setPhase("select");
    setRoutine(null);
    setExIdx(0);
    setSetIdx(0);
    setExerciseData([]);
    setCompletedSetsCount(0);
    startedAt.current = 0;
    startedAtISO.current = "";
    sessionSaved.current = false;
    lastRestSeconds.current = 0;
  };

  const skipRest = () => {
    if (tmr.current) clearTimeout(tmr.current);
    saveRestTime();
    setPhase("workout");
  };

  // ── No active plan ─────────────────────────────────────────────────────────
  if (!activePlan)
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center"
        style={{ minHeight: "70vh" }}
      >
        <p className="text-5xl mb-4">📋</p>
        <p className="text-white font-semibold text-lg">Sin plan activo</p>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Activa un plan primero
        </p>
        <Btn onClick={() => go("plans")}>Ir a Planes</Btn>
      </div>
    );

  // ── Select routine ─────────────────────────────────────────────────────────
  if (phase === "select")
    return (
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">Sesión de hoy</h1>
          <p className="text-gray-500 text-sm">{activePlan.name}</p>
        </div>
        <p className="text-gray-400 text-sm">Elige tu rutina:</p>
        <div className="space-y-3">
          {localRoutines.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRoutine(r);
                setPhase("workout");
                setExIdx(0);
                setSetIdx(0);
                setExerciseData([]);
                setCompletedSetsCount(0);
                const now = Date.now();
                startedAt.current = now;
                startedAtISO.current = new Date(now).toISOString();
                lastRestSeconds.current = 0; // Primera serie no tiene descanso previo
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl p-4 text-left"
            >
              <p className="text-white font-semibold">{r.name}</p>
              <p className="text-gray-500 text-sm mt-1">
                {r.exercises.length > 0
                  ? `${r.exercises.length} ejercicios · ${r.exercises.reduce((a, e) => a + e.sets, 0)} series totales`
                  : "Sin ejercicios — agrégalos desde Planes"}
              </p>
            </button>
          ))}
          {localRoutines.length === 0 && (
            <p className="text-gray-600 text-center py-10">
              El plan activo no tiene rutinas
            </p>
          )}
        </div>
      </div>
    );

  // ── Done ───────────────────────────────────────────────────────────────────
  if (phase === "done")
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold">¡Sesión completada!</h2>
        <p className="text-gray-500 mt-2">
          {exerciseData.filter(Boolean).length} ejercicios · {completedSetsCount}{" "}
          series
        </p>
        <div className="mt-8 space-y-3 w-full max-w-xs">
          <Btn onClick={reset} className="w-full py-3 text-base">
            Nueva sesión
          </Btn>
          <Btn
            onClick={() => go("dashboard")}
            variant="secondary"
            className="w-full py-3 text-base"
          >
            Ir al inicio
          </Btn>
        </div>
      </div>
    );

  // ── Rest timer ─────────────────────────────────────────────────────────────
  if (phase === "rest") {
    const mins = Math.floor(left / 60);
    const secs = left % 60;
    const circ = 2 * Math.PI * 42;
    const offset = circ * (1 - left / restDur);
    const nextLabel =
      setIdx + 1 < (ex?.sets ?? 0)
        ? `Serie ${setIdx + 2} — ${ex?.name}`
        : (routine?.exercises[exIdx + 1]?.name ?? "Finalizar");

    // Deshabilitar skip hasta que pase al menos 1 segundo
    const canSkip = left < restDur;

    return (
      <div className="p-4 flex flex-col items-center">
        <div className="w-full pt-2 mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{routine?.name}</span>
            <span>
              {completedSetsCount}/{totalSets} series
            </span>
          </div>
          <ProgressBar value={(completedSetsCount / totalSets) * 100} />
        </div>

        <p className="text-gray-400 text-sm mb-1">
          Serie {setIdx + 1} completada ✓
        </p>
        <p className="text-gray-500 text-sm mb-10">Siguiente: {nextLabel}</p>

        <div className="relative mb-8">
          <svg
            width="180"
            height="180"
            viewBox="0 0 100 100"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#374151"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="7"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {mins}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-gray-500 text-xs">descanso</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-500 text-sm">Tiempo:</span>
          {[60, 90, 120, 180].map((t) => (
            <button
              key={t}
              onClick={() => setRestDur(t)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${restDur === t ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400"}`}
            >
              {t}s
            </button>
          ))}
        </div>
        <Btn
          variant="secondary"
          onClick={skipRest}
          className="px-8 py-2.5"
          disabled={!canSkip}
        >
          Saltar descanso →
        </Btn>
      </div>
    );
  }

  // ── Workout ────────────────────────────────────────────────────────────────
  if (!ex)
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center"
        style={{ minHeight: "70vh" }}
      >
        <p className="text-5xl mb-4">🏋️</p>
        <p className="text-white font-semibold text-lg">Sin ejercicios</p>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Agrega ejercicios a <strong>{routine?.name}</strong> desde Planes.
        </p>
        <Btn variant="secondary" onClick={reset}>
          Volver
        </Btn>
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="truncate mr-2">{routine?.name}</span>
          <span>
            Ej. {exIdx + 1}/{routine?.exercises.length}
          </span>
        </div>
        <ProgressBar value={(exIdx / (routine?.exercises.length ?? 1)) * 100} />
      </div>

      <Card>
        <h2 className="text-white text-2xl font-bold">{ex.name}</h2>
        <p className="text-gray-500 text-sm mt-1">
          Objetivo: {ex.sets} series × {ex.reps} reps
        </p>
      </Card>

      <div>
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: ex.sets }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i < setIdx
                  ? "bg-emerald-500"
                  : i === setIdx
                    ? "bg-violet-500"
                    : "bg-gray-700"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-white font-semibold">
          Serie {setIdx + 1} de {ex.sets}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Peso (kg)", val: wt, set: setWt, step: "0.5" },
          { label: "Repeticiones", val: rp, set: setRp, step: "1" },
        ].map((f) => (
          <div key={f.label} className="bg-gray-800 rounded-2xl p-4">
            <p className="text-gray-500 text-xs mb-2">{f.label}</p>
            <input
              type="number"
              value={f.val}
              step={f.step}
              min={0}
              onChange={(e) => f.set(e.target.value)}
              className="w-full bg-transparent text-white text-4xl font-bold outline-none"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <button
        onClick={completeSet}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-5 rounded-2xl text-lg transition-colors"
      >
        ✓ Completar serie
      </button>
      <button onClick={reset} className="w-full text-gray-600 text-sm py-2">
        Cancelar sesión
      </button>
    </div>
  );
}
