import dayjs from "dayjs";
import Link from "next/link";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeClass =
    {
      Behavioral: "badge-behavioral",
      Mixed: "badge-mixed",
      Technical: "badge-technical",
    }[normalizedType] || "badge-mixed";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const score = feedback?.totalScore;

  const scoreColor = score
    ? score >= 80
      ? "score-excellent"
      : score >= 60
        ? "score-good"
        : score >= 40
          ? "score-average"
          : "score-poor"
    : "";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between gap-5 min-h-[230px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg capitalize">{role}</h3>
          <p className="text-sm text-text-muted mt-1">{formattedDate}</p>
        </div>
        <Badge variant="outline" className={cn("text-xs capitalize", badgeClass)}>
          {normalizedType}
        </Badge>
      </div>

      {/* Score + Tech */}
      <div className="flex items-center justify-between">
        <DisplayTechIcons techStack={techstack} />

        <div className="flex items-center gap-2">
          {score ? (
            <span className={cn("text-lg font-bold", scoreColor)}>
              {score}
              <span className="text-sm font-normal text-text-muted">/100</span>
            </span>
          ) : (
            <span className="text-sm text-text-muted">Not taken</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <Button
        asChild
        variant={feedback ? "outline" : "default"}
        className={cn(
          "w-full",
          !feedback && "bg-primary text-white hover:bg-primary-dark"
        )}
      >
        <Link
          href={
            feedback
              ? `/interview/${interviewId}/feedback`
              : `/interview/${interviewId}`
          }
        >
          {feedback ? "View Feedback" : "Take Interview"}
        </Link>
      </Button>
    </div>
  );
};

export default InterviewCard;
