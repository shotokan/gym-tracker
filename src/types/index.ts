// ── Plan domain ──────────────────────────────────────────────────────────────

export type PlanStatus = "active" | "inactive" | "draft";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | null; // kg, optional
  notes: string | null;
}

export interface Routine {
  id: string;
  name: string;
  day_of_week: number; // 1=Mon … 7=Sun, 0=any
  exercises: Exercise[];
  created_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  days_per_week: number;
  duration_weeks: number;
  status: PlanStatus;
  routines: Routine[];
  created_at: string;
  updated_at: string;
}

// ── Plan payloads ─────────────────────────────────────────────────────────────

export interface CreatePlanPayload {
  name: string;
  description?: string;
  days_per_week?: number;
  duration_weeks?: number;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  days_per_week?: number;
  duration_weeks?: number;
}

export interface CreateRoutinePayload {
  name: string;
  day_of_week?: number;
  exercises?: Omit<Exercise, "id">[];
}

export interface UpdateRoutinePayload {
  name?: string;
  day_of_week?: number;
  exercises?: Omit<Exercise, "id">[];
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
