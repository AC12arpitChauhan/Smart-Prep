import Link from "next/link";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import ProgressChart from "@/components/ProgressChart";
import TypeDistributionChart from "@/components/TypeDistributionChart";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getUserScoreProgress,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview, scoreProgress] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
    getUserScoreProgress(user?.id!),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back
            {user?.name ? (
              <span className="text-primary">{`, ${user.name}`}</span>
            ) : (
              ""
            )}
          </h1>
          <p className="text-sm text-text-muted max-w-md">
            Your command center for role-specific mock interviews.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-lg font-semibold px-6 h-11 text-sm shadow-none transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Link href="/interview">+ New Interview</Link>
        </Button>
      </div>

      <div className="h-px bg-[#e5e7eb]" />

      {hasPastInterviews && (
        <div className={`grid grid-cols-1 gap-5 ${scoreProgress.length >= 2 ? "lg:grid-cols-10" : ""}`}>
          {scoreProgress.length >= 2 && (
            <div className="lg:col-span-7">
              <ProgressChart data={scoreProgress} />
            </div>
          )}
          <div className={scoreProgress.length >= 2 ? "lg:col-span-3" : ""}>
            <TypeDistributionChart interviews={userInterviews || []} />
          </div>
        </div>
      )}

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Your Interviews
          </h3>
          {hasPastInterviews && (
            <span className="text-xs text-text-muted font-medium">
              {userInterviews?.length} total
            </span>
          )}
        </div>

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
            <div className="card-clean text-center py-16 col-span-full">
              <p className="text-text-muted text-sm">
                You haven&apos;t taken any interviews yet.
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-lg text-sm">
                <Link href="/interview">Create your first</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Available Interviews
          </h3>
          {hasUpcomingInterviews && (
            <span className="text-xs text-text-muted font-medium">
              {allInterview?.length} available
            </span>
          )}
        </div>

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
            <div className="card-clean text-center py-16 col-span-full">
              <p className="text-text-muted text-sm">
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
