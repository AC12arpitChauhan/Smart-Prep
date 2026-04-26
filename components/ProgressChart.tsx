"use client";

import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreEntry {
  score: number;
  date: string;
  role: string;
}

interface ProgressChartProps {
  data: ScoreEntry[];
}

const ProgressChart = ({ data }: ProgressChartProps) => {
  if (data.length < 2) return null;

  const chartData = data.map((entry, index) => ({
    label: dayjs(entry.date).format("MMM D"),
    score: entry.score,
    role: entry.role,
    index: index + 1,
  }));

  const avgScore = Math.round(
    data.reduce((sum, e) => sum + e.score, 0) / data.length
  );

  const latestScore = data[data.length - 1].score;
  const firstScore = data[0].score;
  const trend = latestScore - firstScore;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Score Progress
          </h3>
          <p className="text-sm text-text-muted mt-0.5">
            Your performance across {data.length} interviews
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-muted">Average</p>
            <p className="text-lg font-bold text-text-primary">{avgScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Trend</p>
            <p
              className={`text-lg font-bold ${
                trend > 0
                  ? "text-emerald-600"
                  : trend < 0
                    ? "text-red-500"
                    : "text-text-muted"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            formatter={(value) => [`${Number(value)}/100`, "Score"]}
            labelFormatter={(_label, payload) => {
              if (payload?.[0]?.payload?.role) {
                return payload[0].payload.role;
              }
              return _label;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: "#ffffff",
              stroke: "#f97316",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "#f97316",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
