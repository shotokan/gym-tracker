import type { AppView, GoFn } from "../types";

const tabs = [
  { id: "dashboard", icon: "🏠", label: "Inicio" },
  { id: "plans", icon: "📋", label: "Planes" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "metrics", icon: "⚖️", label: "Cuerpo" },
  { id: "profile", icon: "👤", label: "Perfil" },
] as const;

interface NavProps {
  view: AppView;
  go: GoFn;
}

export default function Nav({ view, go }: NavProps) {
  const isActive = (id: string) => {
    if (id === "dashboard") return ["dashboard", "session"].includes(view);
    if (id === "plans")
      return ["plans", "planDetail", "routineDetail"].includes(view);
    return id === view;
  };

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-800 border-r border-gray-700 min-h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-gray-700">
          <div className="text-4xl mb-2">🏋️</div>
          <h1 className="text-xl font-bold text-white">GymTracker</h1>
          <p className="text-gray-500 text-xs mt-1">
            Tu entrenamiento, tu progreso
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                isActive(t.id)
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="font-medium text-sm">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-600 text-xs text-center">GymTracker v0.1</p>
        </div>
      </aside>

      {/* ── Bottom nav móvil ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex z-50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id as AppView)}
            className={`flex-1 flex flex-col items-center py-2 transition-colors ${
              isActive(t.id) ? "text-violet-400" : "text-gray-600"
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-xs mt-0.5">{t.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
