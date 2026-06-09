import { useState } from "react";
import type { AppView, NavParams, WorkoutSession, BodyMetric } from "./types";
import { SESSIONS0, METRICS0 } from "./data/mocks";
import { useAuth } from "./hooks/useAuth";
import { useActivePlan } from "./hooks/useActivePlan";
import Nav from "./components/Nav";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import { PlansView } from "./views/Plans";
import { PlanDetailView } from "./views/PlanDetail";
import { RoutineDetailView } from "./views/RoutineDetail";
import Session from "./views/Session";
import Stats from "./views/Stats";
import Metrics from "./views/Metrics";
import Profile from "./views/Profile";

export default function App() {
  const {
    isAuth,
    login,
    logout,
    loading: authLoading,
    error: authError,
  } = useAuth();

  const [view, setView] = useState<AppView>("dashboard");
  const [params, setParams] = useState<NavParams>({});
  const [sessions, setSessions] = useState<WorkoutSession[]>(SESSIONS0);
  const [metrics, setMetrics] = useState<BodyMetric[]>(METRICS0);
  const { activePlan } = useActivePlan();

  const go = (v: AppView, p: NavParams = {}): void => {
    setView(v);
    setParams(p);
  };

  if (!isAuth) {
    return <Login onSubmit={login} loading={authLoading} error={authError} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Nav view={view} go={go} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full pb-20 lg:pb-8 lg:py-6 lg:px-4">
          {view === "dashboard" && (
            <Dashboard
              activePlan={activePlan}
              sessions={sessions}
              metrics={metrics}
              go={go}
            />
          )}

          {view === "plans" && <PlansView go={go} />}

          {view === "planDetail" && (
            <PlanDetailView go={go} planId={params.planId ?? ""} />
          )}

          {view === "routineDetail" && (
            <RoutineDetailView
              go={go}
              planId={params.planId ?? ""}
              routineId={params.routineId ?? ""}
            />
          )}

          {view === "session" && (
            <Session
              activePlan={activePlan}
              sessions={sessions}
              setSessions={setSessions}
              go={go}
            />
          )}

          {view === "stats" && <Stats sessions={sessions} />}

          {view === "metrics" && (
            <Metrics metrics={metrics} setMetrics={setMetrics} />
          )}

          {view === "profile" && <Profile onLogout={logout} />}
        </div>
      </main>
    </div>
  );
}
