import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { Badge } from "@/components/ui/badge";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const normalizedType = /mix/gi.test(interview.type) ? "Mixed" : interview.type;

  return (
    <>
      {}
      <div className="card-clean flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="capitalize">{interview.role} Interview</h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-xs capitalize">
                {normalizedType}
              </Badge>
              <DisplayTechIcons techStack={interview.techstack} />
            </div>
          </div>
        </div>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;
