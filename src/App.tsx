import { useState } from "react";
import type { AppView, NavParams } from "./types";
import type { Plan, WorkoutSession, BodyMetric } from "./types";
import { PLANS0, SESSIONS0, METRICS0 } from "./data/mocks";
import { useAuth } from "./hooks/useAuth";
import Nav from "./components/Nav";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Plans from "./views/Plans";
import PlanDetail from "./views/PlanDetail";
import RoutineDetail from "./views/RoutineDetail";
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
  const [plans, setPlans] = useState<Plan[]>(PLANS0);
  const [sessions, setSessions] = useState<WorkoutSession[]>(SESSIONS0);
  const [metrics, setMetrics] = useState<BodyMetric[]>(METRICS0);

  const go = (v: AppView, p: NavParams = {}): void => {
    setView(v);
    setParams(p);
  };

  // If not authenticated, show login screen
  if (!isAuth) {
    return <Login onSubmit={login} loading={authLoading} error={authError} />;
  }

  const activePlan = plans.find((p) => p.active) ?? null;

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
          {view === "plans" && (
            <Plans plans={plans} setPlans={setPlans} go={go} />
          )}
          {view === "planDetail" && (
            <PlanDetail
              plans={plans}
              setPlans={setPlans}
              params={params}
              go={go}
            />
          )}
          {view === "routineDetail" && (
            <RoutineDetail
              plans={plans}
              setPlans={setPlans}
              params={params}
              go={go}
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
