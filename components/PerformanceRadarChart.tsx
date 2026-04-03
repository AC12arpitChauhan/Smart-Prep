"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface PerformanceRadarChartProps {
  categoryScores: CategoryScore[];
}

const PerformanceRadarChart = ({
  categoryScores,
}: PerformanceRadarChartProps) => {
  const data = categoryScores.map((cat) => ({
    category: cat.name.replace("and Clarity", "& Clarity"),
    score: cat.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: "#475569", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#94a3b8", fontSize: 10 }}
          tickCount={6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          formatter={(value) => [`${Number(value)}/100`, "Score"]}
        />
        <Radar
          name="Performance"
          dataKey="score"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceRadarChart;
