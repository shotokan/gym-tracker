import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { BodyMetric } from "../types";
import { Card, Btn, Input } from "../components/ui";
import { uid, toDay, fmtD } from "../utils/helpers";

interface Props {
  metrics: BodyMetric[];
  setMetrics: React.Dispatch<React.SetStateAction<BodyMetric[]>>;
}

export default function Metrics({ metrics, setMetrics }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: toDay(), weight: "", waist: "" });

  const save = () => {
    if (!form.weight && !form.waist) return;
    const m: BodyMetric = {
      id: uid(),
      date: form.date,
      weight: form.weight ? parseFloat(form.weight) : null,
      waist: form.waist ? parseFloat(form.waist) : null,
    };
    setMetrics((p) => [...p, m].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ date: toDay(), weight: "", waist: "" });
    setShowForm(false);
  };

  const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date));
  const wData = sorted
    .filter((m) => m.weight !== null)
    .map((m) => ({ label: fmtD(m.date), v: m.weight }));
  const cData = sorted
    .filter((m) => m.waist !== null)
    .map((m) => ({ label: fmtD(m.date), v: m.waist }));
  const lastM = sorted[sorted.length - 1];
  const firstM = sorted[0];

  const delta = (
    cur: number | null | undefined,
    ini: number | null | undefined,
  ) => (cur != null && ini != null ? (cur - ini).toFixed(1) : null);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold">Cuerpo</h1>
          <p className="text-gray-500 text-sm">Seguimiento físico</p>
        </div>
        <Btn onClick={() => setShowForm(!showForm)}>+ Registrar</Btn>
      </div>

      {showForm && (
        <Card className="space-y-3">
          <p className="text-white font-semibold">Nuevo registro</p>
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Peso (kg)"
              type="number"
              step={0.1}
              value={form.weight}
              onChange={(e) =>
                setForm((p) => ({ ...p, weight: e.target.value }))
              }
              placeholder="80.5"
            />
            <Input
              label="Cintura (cm)"
              type="number"
              step={0.5}
              value={form.waist}
              onChange={(e) =>
                setForm((p) => ({ ...p, waist: e.target.value }))
              }
              placeholder="88"
            />
          </div>
          <div className="flex gap-2">
            <Btn onClick={save} className="flex-1">
              Guardar
            </Btn>
            <Btn
              onClick={() => setShowForm(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Btn>
          </div>
        </Card>
      )}

      {lastM && (
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              l: "Peso actual",
              v: lastM.weight,
              u: "kg",
              d: delta(lastM.weight, firstM?.weight),
            },
            {
              l: "Cintura",
              v: lastM.waist,
              u: "cm",
              d: delta(lastM.waist, firstM?.waist),
            },
          ].map((x) => (
            <Card key={x.l}>
              <p className="text-gray-500 text-xs">{x.l}</p>
              <p className="text-white text-2xl font-bold mt-1">
                {x.v ?? "—"}
                <span className="text-gray-500 text-sm"> {x.u}</span>
              </p>
              {x.d !== null && sorted.length > 1 && (
                <p
                  className={`text-xs mt-1 ${parseFloat(x.d) <= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {x.d} vs inicio
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {wData.length > 1 && (
        <Card>
          <p className="text-white font-semibold mb-1">Peso (kg)</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={wData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                stroke="#4b5563"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <YAxis
                stroke="#4b5563"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: "#34d399", r: 3 }}
                name="kg"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {cData.length > 1 && (
        <Card>
          <p className="text-white font-semibold mb-1">Cintura (cm)</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={cData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                stroke="#4b5563"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <YAxis
                stroke="#4b5563"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
                name="cm"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div>
        <p className="text-gray-500 text-sm font-medium mb-2">Historial</p>
        <div className="space-y-2">
          {[...sorted].reverse().map((m) => (
            <div
              key={m.id}
              className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center"
            >
              <p className="text-gray-400 text-sm">{m.date}</p>
              <div className="flex gap-4">
                {m.weight && (
                  <span className="text-white text-sm">{m.weight} kg</span>
                )}
                {m.waist && (
                  <span className="text-gray-400 text-sm">{m.waist} cm</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
