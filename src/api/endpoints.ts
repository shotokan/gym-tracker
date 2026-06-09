export const EP = {
  auth: {
    login: "/auth/login",
  },
  users: {
    base: "/users",
    byId: (id: string) => `/users/${id}`,
  },
  plans: {
    base: "/plans",
    active: "/plans/active",
    byId: (id: string) => `/plans/${id}`,
    activate: (id: string) => `/plans/${id}/activate`,
    routines: (planId: string) => `/plans/${planId}/routines`,
    routine: (planId: string, routineId: string) =>
      `/plans/${planId}/routines/${routineId}`,
    exercises: (planId: string, routineId: string) =>
      `/plans/${planId}/routines/${routineId}/exercises`,
    exercise: (planId: string, routineId: string, exerciseId: string) =>
      `/plans/${planId}/routines/${routineId}/exercises/${exerciseId}`,
  },
} as const;
