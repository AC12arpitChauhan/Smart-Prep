import Link from "next/link";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      {/* Start Interview Section */}
      <section className="card-clean flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2>Welcome back{user?.name ? `, ${user.name}` : ""}</h2>
          <p className="mt-1">
            Start a new mock interview or review your past sessions.
          </p>
        </div>
        <Button asChild className="btn-primary shrink-0">
          <Link href="/interview">Start New Interview</Link>
        </Button>
      </section>

      {/* Your Interviews */}
      <section className="flex flex-col gap-4">
        <h3>Your Interviews</h3>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <div className="card-clean text-center py-12 col-span-full">
              <p className="text-text-muted">
                You haven&apos;t taken any interviews yet. Start one above!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Available Interviews */}
      <section className="flex flex-col gap-4">
        <h3>Available Interviews</h3>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <div className="card-clean text-center py-12 col-span-full">
              <p className="text-text-muted">
                No interviews available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
