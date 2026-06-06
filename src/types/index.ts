export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
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
  routines: Routine[];
}

export interface CompletedSet {
  w: number; // kg
  r: number; // actual reps performed
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: CompletedSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  planId: string | undefined;
  routineId: string;
  routineName: string;
  exercises: SessionExercise[];
}

export interface BodyMetric {
  id: string;
  date: string;
  weight: number | null;
  waist: number | null;
}

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
