import Agent from "@/components/Agent";
import InterviewGenerator from "@/components/InterviewGenerator";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <div className="card-clean">
        <h2>Generate Interview</h2>
        <p className="mt-1">
          Set up a personalized mock interview — talk to AI, fill a form, or
          paste a job description.
        </p>
      </div>

      <InterviewGenerator userName={user?.name!} userId={user?.id!}>
        <Agent userName={user?.name!} userId={user?.id} type="generate" />
      </InterviewGenerator>
    </>
  );
};

export default Page;
