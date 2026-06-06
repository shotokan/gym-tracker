import { useState, useEffect, useRef } from "react";
import type { Plan, WorkoutSession, SessionExercise, GoFn } from "../types";
import { Card, Btn, ProgressBar } from "../components/ui";
import { uid, toDay } from "../utils/helpers";

type Phase = "select" | "workout" | "rest" | "done";

interface Props {
  activePlan: Plan | null;
  sessions: WorkoutSession[];
  setSessions: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
  go: GoFn;
}

export default function Session({
  activePlan,
  sessions,
  setSessions,
  go,
}: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [routine, setRoutine] = useState<Plan["routines"][number] | null>(null);
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [wt, setWt] = useState("");
  const [rp, setRp] = useState("");
  const [data, setData] = useState<(SessionExercise | undefined)[]>([]);
  const [restDur, setRestDur] = useState(90);
  const [left, setLeft] = useState(0);
  const tmr = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ex = routine?.exercises[exIdx];
  const totalSets = routine?.exercises.reduce((a, e) => a + e.sets, 0) ?? 1;
  const doneSets = data.reduce((a, e) => a + (e?.sets.length ?? 0), 0);

  // Pre-fill when exercise changes
  useEffect(() => {
    if (!ex) return;
    setRp(String(ex.reps));
    let lw = "";
    for (const s of sessions) {
      const rec = s.exercises.find((e) => e.exerciseId === ex.id);
      if (rec?.sets.length) {
        const maxW = Math.max(...rec.sets.map((s) => s.w));
        if (maxW > 0) lw = String(maxW);
        break;
      }
    }
    setWt(lw);
  }, [exIdx, routine?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start timer
  useEffect(() => {
    if (phase === "rest") setLeft(restDur);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick
  useEffect(() => {
    if (phase !== "rest") return;
    if (left > 0) {
      tmr.current = setTimeout(() => setLeft((l) => l - 1), 1000);
    } else {
      setPhase("workout");
    }
    return () => {
      if (tmr.current) clearTimeout(tmr.current);
    };
  }, [phase, left]);

  const completeSet = () => {
    if (!ex || !routine) return;
    const ns = { w: parseFloat(wt) || 0, r: parseInt(rp) || 0 };
    const upd = [...data];
    if (!upd[exIdx])
      upd[exIdx] = { exerciseId: ex.id, name: ex.name, sets: [] };
    else upd[exIdx] = { ...upd[exIdx]!, sets: [...upd[exIdx]!.sets] };
    upd[exIdx]!.sets.push(ns);
    setData(upd);

    const nsi = setIdx + 1;
    const lastSet = nsi >= ex.sets;
    const nei = exIdx + 1;
    const lastEx = nei >= routine.exercises.length;

    if (!lastSet) {
      setSetIdx(nsi);
      setPhase("rest");
    } else if (!lastEx) {
      setExIdx(nei);
      setSetIdx(0);
      setPhase("rest");
    } else {
      setSessions((p) => [
        {
          id: uid(),
          date: toDay(),
          planId: activePlan?.id,
          routineId: routine.id,
          routineName: routine.name,
          exercises: upd.filter((e): e is SessionExercise => e !== undefined),
        },
        ...p,
      ]);
      setPhase("done");
    }
  };

  const reset = () => {
    setPhase("select");
    setRoutine(null);
    setExIdx(0);
    setSetIdx(0);
    setData([]);
  };
  const skipRest = () => {
    if (tmr.current) clearTimeout(tmr.current);
    setPhase("workout");
  };

  // ── No active plan ────────────────────────────────────────
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

  // ── Select routine ────────────────────────────────────────
  if (phase === "select")
    return (
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <h1 className="text-2xl font-bold">Sesión de hoy</h1>
          <p className="text-gray-500 text-sm">{activePlan.name}</p>
        </div>
        <p className="text-gray-400 text-sm">Elige tu rutina:</p>
        <div className="space-y-3">
          {activePlan.routines.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRoutine(r);
                setPhase("workout");
                setExIdx(0);
                setSetIdx(0);
                setData([]);
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl p-4 text-left"
            >
              <p className="text-white font-semibold">{r.name}</p>
              <p className="text-gray-500 text-sm mt-1">
                {r.exercises.length} ejercicios ·{" "}
                {r.exercises.reduce((a, e) => a + e.sets, 0)} series totales
              </p>
            </button>
          ))}
          {activePlan.routines.length === 0 && (
            <p className="text-gray-600 text-center py-10">
              El plan activo no tiene rutinas
            </p>
          )}
        </div>
      </div>
    );

  // ── Done ─────────────────────────────────────────────────
  if (phase === "done")
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold">¡Sesión completada!</h2>
        <p className="text-gray-500 mt-2">
          {data.filter(Boolean).length} ejercicios ·{" "}
          {data.reduce((a, e) => a + (e?.sets.length ?? 0), 0)} series
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

  // ── Rest timer ────────────────────────────────────────────
  if (phase === "rest") {
    const mins = Math.floor(left / 60);
    const secs = left % 60;
    const circ = 2 * Math.PI * 42;
    const offset = circ * (1 - left / restDur);
    const nextLabel =
      setIdx + 1 < (ex?.sets ?? 0)
        ? `Serie ${setIdx + 2} — ${ex?.name}`
        : (routine?.exercises[exIdx + 1]?.name ?? "Finalizar");

    return (
      <div className="p-4 flex flex-col items-center">
        <div className="w-full pt-2 mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{routine?.name}</span>
            <span>
              {doneSets}/{totalSets} series
            </span>
          </div>
          <ProgressBar value={(doneSets / totalSets) * 100} />
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
        <Btn variant="secondary" onClick={skipRest} className="px-8 py-2.5">
          Saltar descanso →
        </Btn>
      </div>
    );
  }

  // ── Workout ───────────────────────────────────────────────
  const completed = data[exIdx]?.sets ?? [];

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
        <h2 className="text-white text-2xl font-bold">{ex?.name}</h2>
        <p className="text-gray-500 text-sm mt-1">
          Objetivo: {ex?.sets} series × {ex?.reps} reps
        </p>
      </Card>

      <div>
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: ex?.sets ?? 0 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                completed.length > i
                  ? "bg-emerald-500"
                  : i === setIdx
                    ? "bg-violet-500"
                    : "bg-gray-700"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-white font-semibold">
          Serie {setIdx + 1} de {ex?.sets}
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

      {completed.length > 0 && (
        <Card>
          <p className="text-gray-500 text-xs mb-2">Series completadas</p>
          <div className="flex flex-wrap gap-2">
            {completed.map((s, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1 rounded-lg font-semibold"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  color: "#34d399",
                }}
              >
                {s.w}kg × {s.r}
              </span>
            ))}
          </div>
        </Card>
      )}

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
