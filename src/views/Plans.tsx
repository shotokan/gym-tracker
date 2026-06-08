import { useState } from "react";
import {
  Plus,
  Search,
  Zap,
  ChevronRight,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { usePlans } from "../hooks/usePlans";
import type { GoFn, Plan, CreatePlanPayload } from "../types";

interface Props {
  go: GoFn;
}

const DAY_LABELS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const STATUS_BADGE: Record<Plan["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-zinc-100 text-zinc-500",
  draft: "bg-amber-100 text-amber-600",
};

// ── Create plan modal ─────────────────────────────────────────────────────────

interface CreateModalProps {
  onSave: (payload: CreatePlanPayload) => Promise<Plan>;
  onClose: () => void;
}

function CreatePlanModal({ onSave, onClose }: CreateModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [days, setDays] = useState(3);
  const [weeks, setWeeks] = useState(8);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: desc.trim(),
        days_per_week: days,
        duration_weeks: weeks,
      });
      onClose();
    } catch {
      setErr("Error al crear el plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-800">Nuevo plan</h2>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="space-y-3">
          <input
            className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Nombre del plan *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
            placeholder="Descripción (opcional)"
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
                Días / semana
              </label>
              <input
                type="number"
                min={1}
                max={7}
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
                Duración (semanas)
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 font-medium"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium disabled:opacity-50"
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
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <button className="w-full text-left p-4" onClick={onOpen}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[plan.status]}`}
              >
                {plan.status === "active"
                  ? "Activo"
                  : plan.status === "draft"
                    ? "Borrador"
                    : "Inactivo"}
              </span>
            </div>
            <p className="font-semibold text-zinc-800 truncate">{plan.name}</p>
            {plan.description && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                {plan.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg hover:bg-zinc-50"
              onClick={(e) => {
                e.stopPropagation();
                setMenu((m) => !m);
              }}
            >
              <MoreVertical size={16} className="text-zinc-400" />
            </button>
            <ChevronRight size={16} className="text-zinc-300" />
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-xs text-zinc-500">
          <span>{plan.days_per_week}d / sem</span>
          <span>{plan.duration_weeks} semanas</span>
          <span>{plan.routines.length} rutinas</span>
        </div>

        {plan.routines.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {plan.routines.slice(0, 5).map((r) => (
              <span
                key={r.id}
                className="text-xs bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1"
              >
                {r.day_of_week > 0 ? DAY_LABELS[r.day_of_week] : ""} {r.name}
              </span>
            ))}
            {plan.routines.length > 5 && (
              <span className="text-xs text-zinc-400">
                +{plan.routines.length - 5}
              </span>
            )}
          </div>
        )}
      </button>

      {menu && (
        <div className="border-t border-zinc-100 flex">
          {plan.status !== "active" && (
            <button
              className="flex-1 py-2.5 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5 hover:bg-emerald-50"
              onClick={() => {
                onActivate();
                setMenu(false);
              }}
            >
              <Zap size={13} /> Activar
            </button>
          )}
          <button
            className="flex-1 py-2.5 text-xs font-medium text-red-500 flex items-center justify-center gap-1.5 hover:bg-red-50"
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
    <div className="flex flex-col h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-zinc-900">Planes</h1>
          <button
            className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-3 py-2 rounded-xl"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} /> Nuevo
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Buscar planes…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">
            Cargando planes…
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-sm mb-3">
              {search ? "Sin resultados" : "Aún no tienes planes"}
            </p>
            {!search && (
              <button
                className="text-sm font-medium text-zinc-900 underline underline-offset-2"
                onClick={() => setShowCreate(true)}
              >
                Crear tu primer plan
              </button>
            )}
          </div>
        )}

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
