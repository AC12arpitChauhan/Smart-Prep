"use client";

import { cn } from "@/lib/utils";

interface ScoreProgressBarProps {
  label: string;
  score: number;
  maxScore?: number;
}

const ScoreProgressBar = ({
  label,
  score,
  maxScore = 100,
}: ScoreProgressBarProps) => {
  const percentage = Math.round((score / maxScore) * 100);

  const barColor =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 60
        ? "bg-blue-500"
        : percentage >= 40
          ? "bg-amber-500"
          : "bg-red-500";

  const textColor =
    percentage >= 80
      ? "text-green-600"
      : percentage >= 60
        ? "text-blue-600"
        : percentage >= 40
          ? "text-amber-600"
          : "text-red-600";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className={cn("font-bold", textColor)}>
          {score}/{maxScore}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreProgressBar;
