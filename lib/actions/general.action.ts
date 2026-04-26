"use server";

import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { getRandomInterviewCover } from "@/lib/utils";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  let query: any = db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true);

  if (userId) {
    query = query.where("userId", "!=", userId);
  }

  const interviews = await query.limit(limit).get();

  return interviews.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function extractJobDescription(
  jdText: string
): Promise<JDExtractionResult> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash", { structuredOutputs: false }),
    schema: z.object({
      role: z
        .string()
        .describe(
          "The job title/role, e.g. 'Frontend Developer', 'Data Scientist'"
        ),
      level: z
        .enum(["Junior", "Mid", "Senior"])
        .describe("The experience level required"),
      techstack: z
        .string()
        .describe(
          "Comma-separated list of key technologies/skills mentioned, e.g. 'React, TypeScript, Next.js'"
        ),
      type: z
        .enum(["Technical", "Behavioral", "Mixed"])
        .describe(
          "Whether the interview should focus on technical skills, behavioral questions, or a mix. Decide based on the job description emphasis."
        ),
    }),
    prompt: `Analyze the following job description and extract structured interview parameters from it.
If the job description is vague or missing details, make reasonable inferences based on context.

Job Description:
${jdText}`,
    system:
      "You are an expert HR analyst. Extract the role, experience level, tech stack, and recommended interview type from job descriptions. Be concise and accurate.",
  });

  return object;
}

export async function generateInterviewFromForm(
  params: GenerateInterviewParams
) {
  const { role, level, techstack, type, amount, userid } = params;

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
        Thank you! <3`,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((s: string) => s.trim()),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return { success: true, interviewId: docRef.id };
  } catch (error) {
    console.error("Error generating interview from form:", error);
    return { success: false, interviewId: null };
  }
}

