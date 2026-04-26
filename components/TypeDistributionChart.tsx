"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TypeDistributionProps {
  interviews: { role: string; type: string }[];
}

const DOMAINS = [
  {
    name: "Web Technologies",
    color: "#6366f1",
    keywords: [
      "frontend", "front-end", "front end",
      "backend", "back-end", "back end",
      "fullstack", "full-stack", "full stack",
      "web", "react", "angular", "vue", "next",
      "node", "express", "django", "flask",
      "rails", "php", "wordpress", "html", "css",
      "javascript", "typescript", "mern", "mean",
    ],
  },
  {
    name: "Data Science",
    color: "#0ea5e9",
    keywords: [
      "data analyst", "data science", "data scientist",
      "data engineer", "analytics", "business intelligence",
      "bi ", "statistics", "visualization", "tableau",
      "power bi", "sql", "etl", "data pipeline",
    ],
  },
  {
    name: "ML & AI",
    color: "#8b5cf6",
    keywords: [
      "machine learning", "ml ", "ai ", "artificial intelligence",
      "deep learning", "nlp", "natural language",
      "computer vision", "neural", "tensorflow",
      "pytorch", "llm", "generative", "model training",
    ],
  },
  {
    name: "DevOps & Cloud",
    color: "#f59e0b",
    keywords: [
      "devops", "cloud", "infrastructure", "sre",
      "site reliability", "kubernetes", "docker",
      "aws", "azure", "gcp", "platform engineer",
      "ci/cd", "cicd", "terraform", "linux", "system",
    ],
  },
  {
    name: "Mobile & Apps",
    color: "#10b981",
    keywords: [
      "mobile", "android", "ios", "flutter", "react native",
      "swift", "kotlin", "app developer", "cross-platform",
    ],
  },
];

function classifyRole(role: string): string {
  const r = role.toLowerCase();
  for (const domain of DOMAINS) {
    if (domain.keywords.some((kw) => r.includes(kw))) {
      return domain.name;
    }
  }
  return "Other";
}

function getDomainColor(name: string): string {
  const domain = DOMAINS.find((d) => d.name === name);
  return domain?.color || "#94a3b8";
}

const TypeDistributionChart = ({ interviews }: TypeDistributionProps) => {
  if (!interviews || interviews.length === 0) return null;

  const counts: Record<string, number> = {};
  interviews.forEach((interview) => {
    const domain = classifyRole(interview.role);
    counts[domain] = (counts[domain] || 0) + 1;
  });

  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = interviews.length;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Interview Domains
        </h3>
        <p className="text-sm text-text-muted mt-0.5">
          {total} interview{total !== 1 ? "s" : ""} by domain
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[160px]">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={getDomainColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value, name) => [
                `${Number(value)} (${Math.round((Number(value) / total) * 100)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getDomainColor(entry.name) }}
              />
              <span className="text-sm text-text-secondary">{entry.name}</span>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypeDistributionChart;
