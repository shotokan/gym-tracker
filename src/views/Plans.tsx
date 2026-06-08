import { useState } from "react";
import {
  Plus,
  Search,
  Zap,
  ChevronRight,
  Trash2,
  MoreVertical,
  Dumbbell,
  X,
} from "lucide-react";
import { usePlans } from "../hooks/usePlans";
import type { GoFn, Plan, CreatePlanPayload } from "../types";

interface Props {
  go: GoFn;
}

// ── Create modal ──────────────────────────────────────────────────────────────

interface CreateModalProps {
  onSave: (payload: CreatePlanPayload) => Promise<Plan>;
  onClose: () => void;
}

function CreatePlanModal({ onSave, onClose }: CreateModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim() });
      onClose();
    } catch {
      setErr("Error al crear el plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 w-full rounded-t-2xl sm:rounded-2xl sm:max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nuevo plan</h2>
          <button
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}

        <input
          className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nombre del plan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />

        <div className="flex gap-3">
          <button
            className="flex-1 py-3 rounded-xl border border-gray-600 text-sm text-gray-300 font-medium"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Crear plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  onOpen: () => void;
  onActivate: () => void;
  onDelete: () => void;
}

function PlanCard({ plan, onOpen, onActivate, onDelete }: PlanCardProps) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      <div className="w-full text-left p-4 cursor-pointer" onClick={onOpen}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {plan.active && (
              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                Activo
              </span>
            )}
            <p className="font-semibold text-white truncate">{plan.name}</p>
            <p className="text-xs text-gray-500 mt-1">{plan.created_at}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setMenu((m) => !m);
              }}
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            <ChevronRight size={16} className="text-gray-600" />
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
          <Dumbbell size={11} />
          <span>{(plan.routines ?? []).length} rutinas</span>
        </div>
      </div>

      {menu && (
        <div className="border-t border-gray-700 flex">
          {!plan.active && (
            <button
              className="flex-1 py-2.5 text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5 hover:bg-emerald-500/10 transition-colors"
              onClick={() => {
                onActivate();
                setMenu(false);
              }}
            >
              <Zap size={13} /> Activar
            </button>
          )}
          <button
            className="flex-1 py-2.5 text-xs font-medium text-red-400 flex items-center justify-center gap-1.5 hover:bg-red-500/10 transition-colors"
            onClick={() => {
              onDelete();
              setMenu(false);
            }}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function PlansView({ go }: Props) {
  const {
    plans,
    loading,
    error,
    createPlan,
    activatePlan,
    removePlan,
    fetchPlans,
  } = usePlans();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleSearch = (val: string) => {
    setSearch(val);
    fetchPlans(val || undefined);
  };

  const filtered = search
    ? plans.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : plans;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Planes</h1>
        <button
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Buscar planes…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          Cargando planes…
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-3">
            {search ? "Sin resultados" : "Aún no tienes planes"}
          </p>
          {!search && (
            <button
              className="text-sm font-medium text-indigo-400 underline underline-offset-2"
              onClick={() => setShowCreate(true)}
            >
              Crear tu primer plan
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onOpen={() => go("planDetail", { planId: plan.id })}
            onActivate={() => activatePlan(plan.id)}
            onDelete={() => removePlan(plan.id)}
          />
        ))}
      </div>

      {showCreate && (
        <CreatePlanModal
          onSave={createPlan}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
