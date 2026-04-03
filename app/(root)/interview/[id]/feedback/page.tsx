import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/actions/auth.action";
import PerformanceRadarChart from "@/components/PerformanceRadarChart";
import ScoreProgressBar from "@/components/ScoreProgressBar";
import FeedbackAccordion from "@/components/FeedbackAccordion";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const totalScore = feedback?.totalScore ?? 0;

  const scoreLabel =
    totalScore >= 80
      ? "Excellent"
      : totalScore >= 60
        ? "Good"
        : totalScore >= 40
          ? "Average"
          : "Needs Improvement";

  const scoreBadgeClass =
    totalScore >= 80
      ? "bg-green-50 text-green-700 border-green-200"
      : totalScore >= 60
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : totalScore >= 40
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-red-50 text-red-700 border-red-200";

  return (
    <section className="section-feedback">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="capitalize">{interview.role} — Interview Feedback</h1>
          <p className="text-sm text-text-muted mt-1">
            {feedback?.createdAt
              ? dayjs(feedback.createdAt).format("MMMM D, YYYY · h:mm A")
              : "N/A"}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-sm font-semibold px-3 py-1 ${scoreBadgeClass}`}
        >
          {scoreLabel}
        </Badge>
      </div>

      <Separator />

      {/* Overall Evaluation — Full Width */}
      <div className="card-clean">
        <h3 className="mb-3">Overall Evaluation</h3>
        <p className="text-text-secondary leading-relaxed">
          {feedback?.finalAssessment}
        </p>
      </div>

      {/* Radar Chart + Scorecard side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Radar Chart (65%) */}
        <div className="lg:col-span-7">
          <div className="card-clean h-full">
            <h3 className="mb-4">Performance Overview</h3>
            {feedback?.categoryScores && (
              <PerformanceRadarChart
                categoryScores={feedback.categoryScores}
              />
            )}
          </div>
        </div>

        {/* Scorecard (35%) */}
        <div className="lg:col-span-3">
          <div className="card-clean h-full">
            <h3 className="mb-4">Scorecard</h3>

            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-24 rounded-full border-4 border-primary/20 bg-primary-50">
                <span className="text-3xl font-bold text-primary">
                  {totalScore}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-2">Overall Score</p>
            </div>

            <Separator className="mb-4" />

            {/* Category Progress Bars */}
            <div className="space-y-4">
              {feedback?.categoryScores?.map((category, index) => (
                <ScoreProgressBar
                  key={index}
                  label={category.name}
                  score={category.score}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses — Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
          <div className="w-1 bg-green-500 shrink-0" />
          <div className="p-6 flex-1">
            <h3 className="text-green-700 mb-4 flex items-center gap-2 text-lg">
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-3 list-none">
              {feedback?.strengths?.map((strength, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2.5"
                >
                  <span className="text-green-500 text-lg leading-none shrink-0">•</span>
                  <span className="text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
          <div className="w-1 bg-amber-500 shrink-0" />
          <div className="p-6 flex-1">
            <h3 className="text-amber-700 mb-4 flex items-center gap-2 text-lg">
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              Areas for Improvement
            </h3>
            <ul className="space-y-3 list-none">
              {feedback?.areasForImprovement?.map((area, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2.5"
                >
                  <span className="text-amber-500 text-lg leading-none shrink-0">•</span>
                  <span className="text-slate-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Accordion */}
      <div className="card-clean">
        <h3 className="mb-4">Detailed Category Breakdown</h3>
        {feedback?.categoryScores && (
          <FeedbackAccordion categoryScores={feedback.categoryScores} />
        )}
      </div>

      {/* Action Buttons */}
      <div className="buttons">
        <Button asChild variant="outline" className="min-w-40">
          <Link href="/">Back to Dashboard</Link>
        </Button>

        <Button asChild className="bg-primary text-white hover:bg-primary-dark min-w-40">
          <Link href={`/interview/${id}`}>Retake Interview</Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
