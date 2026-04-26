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

// Warm Autumn Glow palette for card headers
// Bronze Spice #CC5803 | Autumn Leaf #E2711D | Deep Saffron #FF9505
// Amber Flame #FFB627 | Sunflower Gold #FFC971
const CARD_GRADIENTS = [
  "bg-linear-to-br from-[#CC5803] to-[#E2711D]",   // Bronze → Autumn
  "bg-linear-to-br from-[#E2711D] to-[#FF9505]",   // Autumn → Saffron
  "bg-linear-to-br from-[#FF9505] to-[#FFB627]",   // Saffron → Amber
  "bg-linear-to-br from-[#FFB627] to-[#FFC971]",   // Amber → Gold
  "bg-linear-to-br from-[#CC5803] to-[#FF9505]",   // Bronze → Saffron
  "bg-linear-to-br from-[#E2711D] to-[#FFB627]",   // Autumn → Amber
  "bg-linear-to-br from-[#CC5803] to-[#FFB627]",   // Bronze → Amber
  "bg-linear-to-br from-[#E2711D] to-[#FFC971]",   // Autumn → Gold
] as const;

const getRoleGradient = (role: string) => {
  const roleLower = role.toLowerCase();

  if (roleLower.includes("front"))     return CARD_GRADIENTS[0]; // Bronze → Autumn
  if (roleLower.includes("back"))      return CARD_GRADIENTS[1]; // Autumn → Saffron
  if (roleLower.includes("full"))      return CARD_GRADIENTS[2]; // Saffron → Amber
  if (roleLower.includes("devops"))    return CARD_GRADIENTS[3]; // Amber → Gold
  if (roleLower.includes("data"))      return CARD_GRADIENTS[4]; // Bronze → Saffron
  if (roleLower.includes("machine") || roleLower.includes("ml") || roleLower.includes("ai"))
    return CARD_GRADIENTS[5]; // Autumn → Amber
  if (roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("ux"))
    return CARD_GRADIENTS[6]; // Bronze → Amber
  if (roleLower.includes("mobile") || roleLower.includes("android") || roleLower.includes("ios"))
    return CARD_GRADIENTS[7]; // Autumn → Gold

  // Deterministic hash fallback
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
      ? "score-excellent"
      : score >= 60
        ? "score-good font-semibold"
        : score >= 40
          ? "score-average"
          : "score-poor"
    : "";

  return (
    <Card className="flex flex-col h-full border-slate-200 hover:shadow-lg transition-all group overflow-hidden">
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
