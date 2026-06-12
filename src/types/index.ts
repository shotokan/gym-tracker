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

// ── Session domain (API types) ───────────────────────────────────────────────

export interface CompletedSet {
  weight: number;
  reps: number;
  rest_seconds: number;
}

export interface SessionExerciseInput {
  exercise_id: string;
  name: string;
  sets: CompletedSet[];
}

export interface SessionExercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string;
  routine_id: string;
  routine_name: string;
  date: string;
  duration_secs: number;
  exercises: SessionExercise[];
  total_sets: number;
  total_volume: number;
  total_rest_seconds: number;
  created_at: string;
  started_at: string;
  finished_at: string;
}

export interface CreateSessionPayload {
  plan_id?: string;
  routine_id: string;
  routine_name: string;
  date?: string;
  duration_secs: number;
  exercises: SessionExerciseInput[];
  started_at: string;
  finished_at: string;
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
  | "sessionDetail"
  | "stats"
  | "metrics"
  | "profile";

export interface NavParams {
  planId?: string;
  routineId?: string;
  sessionId?: string;
  session?: WorkoutSession;
}
export type GoFn = (view: AppView, params?: NavParams) => void;
