import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <div className="card-clean">
        <h2>Generate Interview</h2>
        <p className="mt-1">
          Talk to our AI assistant to set up a personalized mock interview.
        </p>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        type="generate"
      />
    </>
  );
};

export default Page;
