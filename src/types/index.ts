// ── Plan domain ──────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // 0 = not specified
  notes: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Plan {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  routines: Routine[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────

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

export interface CreateExercisePayload {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface UpdateExercisePayload {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
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
