import dayjs from "dayjs";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import DisplayTechIcons from "./DisplayTechIcons";
import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const CARD_GRADIENTS = [
  "bg-linear-to-br from-[#CC5803] to-[#E2711D]",
  "bg-linear-to-br from-[#E2711D] to-[#FF9505]",
  "bg-linear-to-br from-[#FF9505] to-[#FFB627]",
  "bg-linear-to-br from-[#FFB627] to-[#FFC971]",
  "bg-linear-to-br from-[#CC5803] to-[#FF9505]",
  "bg-linear-to-br from-[#E2711D] to-[#FFB627]",
  "bg-linear-to-br from-[#CC5803] to-[#FFB627]",
  "bg-linear-to-br from-[#E2711D] to-[#FFC971]",
] as const;

const getRoleGradient = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("front"))   return CARD_GRADIENTS[0];
  if (r.includes("back"))    return CARD_GRADIENTS[1];
  if (r.includes("full"))    return CARD_GRADIENTS[2];
  if (r.includes("devops"))  return CARD_GRADIENTS[3];
  if (r.includes("data"))    return CARD_GRADIENTS[4];
  if (r.includes("machine") || r.includes("ml") || r.includes("ai"))
    return CARD_GRADIENTS[5];
  if (r.includes("design") || r.includes("ui") || r.includes("ux"))
    return CARD_GRADIENTS[6];
  if (r.includes("mobile") || r.includes("android") || r.includes("ios"))
    return CARD_GRADIENTS[7];


  let hash = 0;
  for (let i = 0; i < role.length; i++) {
    hash = role.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length];
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
      ? "text-emerald-600"
      : score >= 60
        ? "text-sky-600"
        : score >= 40
          ? "text-amber-600"
          : "text-red-500"
    : "";


  const scorePercent = score ? Math.min(score, 100) : 0;
  const scoreBarColor = score
    ? score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-sky-500"
        : score >= 40
          ? "bg-amber-500"
          : "bg-red-500"
    : "bg-slate-200";

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] hover:border-[#d1d5db] transition-all duration-200 group bg-white">

      <div className={cn("h-28 w-full transition-transform group-hover:scale-[1.02] duration-500 flex items-center justify-center overflow-hidden relative px-4", getRoleGradient(role))}>
        <div className="absolute inset-0 bg-black/5" />
        <span className="text-white/20 text-4xl font-black uppercase tracking-tighter select-none truncate text-center w-full">
          {role}
        </span>
      </div>

      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold capitalize leading-snug text-text-primary group-hover:text-[#4f46e5] transition-colors">
            {role}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] uppercase font-semibold shrink-0 tracking-wide rounded-md px-2 py-0.5",
              badgeClass
            )}
          >
            {normalizedType}
          </Badge>
        </div>
        <CardDescription className="text-xs text-text-muted mt-1.5">
          {formattedDate}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pt-4 pb-0 flex-1 flex flex-col justify-end gap-4">

        <div className="flex items-center justify-between">
          <DisplayTechIcons techStack={techstack} />
        </div>


        <div className="space-y-2">
          {score ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Score</span>
                <span className={cn("text-sm font-bold", scoreColor)}>
                  {score}
                  <span className="text-text-muted font-normal">/100</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", scoreBarColor)}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-xs text-text-muted">Not taken yet</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-5 pt-4 pb-5">
        <Button
          asChild
          variant={feedback ? "outline" : "default"}
          className={cn(
            "w-full h-10 font-semibold text-sm rounded-lg transition-all",
            feedback
              ? "border-[#e5e7eb] hover:bg-slate-50 text-text-primary"
              : "bg-primary text-white hover:bg-primary-dark"
          )}
        >
          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            {feedback ? "Review Analytics" : "Start Interview"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
