import dayjs from "dayjs";
import Link from "next/link";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import DisplayTechIcons from "./DisplayTechIcons";
import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

// Helper to generate a consistent gradient based on role
const getRoleGradient = (role: string) => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes("front")) return "bg-linear-to-br from-orange-400 to-amber-500";
  if (roleLower.includes("back")) return "bg-linear-to-br from-orange-600 to-orange-400";
  if (roleLower.includes("devops")) return "bg-linear-to-br from-slate-700 to-slate-500";
  if (roleLower.includes("full")) return "bg-linear-to-br from-orange-500 to-rose-400";
  return "bg-linear-to-br from-orange-400 to-amber-300";
};

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
        ? "score-good font-semibold"
        : score >= 40
          ? "score-average"
          : "score-poor"
    : "";

  return (
    <Card className="flex flex-col h-full border-slate-200 hover:shadow-lg transition-all group overflow-hidden">
      {/* Visual Header / "Image" substitute */}
      <div className={cn("h-28 w-full transition-transform group-hover:scale-105 duration-500 flex items-center justify-center overflow-hidden relative px-4", getRoleGradient(role))}>
        <div className="absolute inset-0 bg-black/5" />
        <span className="text-white/20 text-4xl font-black uppercase tracking-tighter select-none truncate text-center w-full">
          {role}
        </span>
      </div>

      <CardHeader className="p-5 pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl capitalize leading-tight group-hover:text-primary transition-colors">
            {role}
          </CardTitle>
          <Badge variant="outline" className={cn("text-[10px] uppercase font-bold shrink-0 border-slate-200", badgeClass)}>
            {normalizedType}
          </Badge>
        </div>
        <CardDescription className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wider">
          {formattedDate}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-end gap-6">
        <div className="flex items-center justify-between">
          <DisplayTechIcons techStack={techstack} />

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            {score ? (
              <span className={cn("text-lg font-bold leading-none", scoreColor)}>
                {score}
                <span className="text-xs font-medium text-text-muted ml-0.5">/100</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-text-muted uppercase tracking-tight">Not taken</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          asChild
          variant={feedback ? "outline" : "default"}
          className={cn(
            "w-full h-11 font-bold text-sm transition-all",
            !feedback && "bg-primary text-white hover:bg-primary-dark shadow-orange-100"
          )}
        >
          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            {feedback ? "Review Analytics" : "Start Interview session"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
