import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 border-slate-200 bg-linear-to-r from-white to-orange-50/30">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-text-primary">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-text-secondary text-base font-medium max-w-md">
            Your intelligent command center for mastering role-specific mock interviews.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full shadow-lg shadow-orange-100 font-bold px-8 h-12 text-base transition-all hover:scale-105 active:scale-95">
          <Link href="/interview">Ready to prep?</Link>
        </Button>
      </Card>

      <Separator />

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
