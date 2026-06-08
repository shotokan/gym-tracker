// ── Plan domain ──────────────────────────────────────────────────────────────

export interface Routine {
  id: string;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  routines: Routine[];
}

// ── Plan payloads ─────────────────────────────────────────────────────────────

export interface CreatePlanPayload {
  name: string;
}
export interface UpdatePlanPayload {
  name: string;
}
export interface CreateRoutinePayload {
  name: string;
}
export interface UpdateRoutinePayload {
  name: string;
}

// ── Session domain ────────────────────────────────────────────────────────────

export interface CompletedSet {
  w: number;
  r: number;
}
export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: CompletedSet[];
}
export interface WorkoutSession {
  id: string;
  date: string;
  planId: string | undefined;
  routineId: string;
  routineName: string;
  exercises: SessionExercise[];
}

// ── Metrics domain ────────────────────────────────────────────────────────────

export interface BodyMetric {
  id: string;
  date: string;
  weight: number | null;
  waist: number | null;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export type AppView =
  | "dashboard"
  | "plans"
  | "planDetail"
  | "routineDetail"
  | "session"
  | "stats"
  | "metrics"
  | "profile";

export interface NavParams {
  planId?: string;
  routineId?: string;
}
export type GoFn = (view: AppView, params?: NavParams) => void;
