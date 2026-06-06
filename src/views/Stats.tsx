import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WorkoutSession } from "../types";
import { Card } from "../components/ui";
import { fmtD } from "../utils/helpers";

interface ChartPoint {
  date: string;
  label: string;
  weight: number;
}

export default function Stats({ sessions }: { sessions: WorkoutSession[] }) {
  const exMap: Record<string, ChartPoint[]> = {};
  [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((s) => {
      s.exercises.forEach((ex) => {
        if (!exMap[ex.name]) exMap[ex.name] = [];
        const maxW = ex.sets.length ? Math.max(...ex.sets.map((s) => s.w)) : 0;
        exMap[ex.name].push({
          date: s.date,
          label: fmtD(s.date),
          weight: maxW,
        });
      });
    });

  const names = Object.keys(exMap);
  const [sel, setSel] = useState(names[0] ?? "");
  useEffect(() => {
    if (names.length && !names.includes(sel)) setSel(names[0]);
  }, [names.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = sel ? exMap[sel] : [];
  const first = chartData[0]?.weight;
  const last = chartData[chartData.length - 1]?.weight;
  const diff = first !== undefined && last !== undefined ? last - first : null;

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-gray-500 text-sm">Progresión de pesos</p>
      </div>

      {names.length === 0 ? (
        <p className="text-gray-600 text-center py-20 text-sm">
          Completa sesiones para ver estadísticas
        </p>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {names.map((n) => (
              <button
                key={n}
                onClick={() => setSel(n)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-sm font-medium flex-shrink-0 transition-colors ${sel === n ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400"}`}
              >
                {n}
              </button>
            ))}
          </div>

          <Card>
            <p className="text-white font-semibold">{sel}</p>
            <p className="text-gray-500 text-xs mb-4">
              Peso máximo por sesión (kg)
            </p>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="label"
                    stroke="#4b5563"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <YAxis
                    stroke="#4b5563"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "none",
                      borderRadius: 10,
                    }}
                    itemStyle={{ color: "#a78bfa" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={{ fill: "#7c3aed", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="kg"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">
                Necesitas al menos 2 sesiones con este ejercicio
              </p>
            )}
          </Card>

          {chartData.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Inicio", v: `${first} kg`, c: "text-white" },
                { l: "Actual", v: `${last} kg`, c: "text-white" },
                {
                  l: "Ganado",
                  v:
                    diff !== null
                      ? `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg`
                      : "—",
                  c:
                    diff !== null && diff >= 0
                      ? "text-emerald-400"
                      : "text-red-400",
                },
              ].map((x) => (
                <Card key={x.l} className="text-center py-3">
                  <p className="text-gray-500 text-xs">{x.l}</p>
                  <p className={`font-bold mt-1 text-sm ${x.c}`}>{x.v}</p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
