import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("FULL BODY FROM VAPI:", JSON.stringify(body, null, 2));
  
  // Robust extraction: Check if Vapi sent a formal tool-calls webhook payload
  let args = body;
  if (body.message?.type === "tool-calls") {
    const toolCall = body.message.toolWithToolCallList?.[0]?.toolCall;
    if (toolCall?.function?.arguments) {
      args = toolCall.function.arguments;
    }
  }

  // Fallback to flat params safely
  const type = args.type || "Technical";
  const role = args.role || "Developer";
  const level = args.level || "Junior";
  const techstack = args.techstack || "React";
  const amount = args.amount || "3";
  const userid = args.userid || args.userId || "anonymous";

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);
    
    // Purge frontend cache so new interview shows instantly on redirect
    revalidatePath("/");

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
