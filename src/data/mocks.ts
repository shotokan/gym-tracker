import type { Plan, WorkoutSession, BodyMetric } from "../types";

export const PLANS0: Plan[] = [
  {
    id: "p1",
    name: "Mes 1 — Volumen",
    active: true,
    created_at: "2026-06-01",
    routines: [
      { id: "r1", name: "Lunes — Pecho & Tríceps" },
      { id: "r2", name: "Miércoles — Espalda & Bíceps" },
      { id: "r3", name: "Viernes — Piernas & Hombros" },
    ],
  },
  {
    id: "p2",
    name: "Mes 2 — Fuerza",
    active: false,
    created_at: "2026-06-01",
    routines: [],
  },
];

export const SESSIONS0: WorkoutSession[] = [
  {
    id: "s1",
    date: "2026-06-02",
    planId: "p1",
    routineId: "r1",
    routineName: "Lunes — Pecho & Tríceps",
    exercises: [
      {
        exerciseId: "e1",
        name: "Press Banca",
        sets: [
          { w: 60, r: 10 },
          { w: 65, r: 9 },
          { w: 65, r: 8 },
          { w: 60, r: 10 },
        ],
      },
      {
        exerciseId: "e2",
        name: "Press Inclinado",
        sets: [
          { w: 50, r: 12 },
          { w: 50, r: 11 },
          { w: 50, r: 10 },
        ],
      },
    ],
  },
  {
    id: "s2",
    date: "2026-05-28",
    planId: "p1",
    routineId: "r2",
    routineName: "Miércoles — Espalda & Bíceps",
    exercises: [
      {
        exerciseId: "e5",
        name: "Dominadas",
        sets: [
          { w: 0, r: 8 },
          { w: 0, r: 7 },
          { w: 0, r: 6 },
        ],
      },
      {
        exerciseId: "e6",
        name: "Remo con barra",
        sets: [
          { w: 70, r: 10 },
          { w: 70, r: 10 },
          { w: 75, r: 9 },
          { w: 75, r: 8 },
        ],
      },
    ],
  },
  {
    id: "s3",
    date: "2026-05-26",
    planId: "p1",
    routineId: "r1",
    routineName: "Lunes — Pecho & Tríceps",
    exercises: [
      {
        exerciseId: "e1",
        name: "Press Banca",
        sets: [
          { w: 55, r: 10 },
          { w: 60, r: 10 },
          { w: 60, r: 9 },
          { w: 55, r: 10 },
        ],
      },
    ],
  },
  {
    id: "s4",
    date: "2026-05-19",
    planId: "p1",
    routineId: "r1",
    routineName: "Lunes — Pecho & Tríceps",
    exercises: [
      {
        exerciseId: "e1",
        name: "Press Banca",
        sets: [
          { w: 50, r: 10 },
          { w: 55, r: 10 },
          { w: 55, r: 10 },
          { w: 55, r: 9 },
        ],
      },
    ],
  },
];

export const METRICS0: BodyMetric[] = [
  { id: "m1", date: "2026-05-01", weight: 82.5, waist: 90 },
  { id: "m2", date: "2026-05-08", weight: 82.0, waist: 89 },
  { id: "m3", date: "2026-05-15", weight: 81.5, waist: 88.5 },
  { id: "m4", date: "2026-05-22", weight: 81.0, waist: 88 },
  { id: "m5", date: "2026-06-01", weight: 80.5, waist: 87.5 },
];
