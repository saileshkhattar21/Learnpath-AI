import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { buildAiContext } from "./ai-context.service.js";
import {
  createLearningPath,
  findLearningPath,
  findLearningPathTrackIds,
} from "../models/learning-path.model.js";
import { findLatestAttemptForUserTrack } from "../models/track-assessment.model.js";
import { deleteLearningPath } from "../models/learning-path.model.js";

const aiPathSchema = z.object({
  summary: z.string().min(1).max(700),
  recommendedStartingPoint: z.string().min(1).max(300),
  items: z
    .array(
      z.object({
        courseId: z.string().min(1),
        sectionId: z.string().min(1).nullable(),
        reason: z.string().min(1).max(400),
      }),
    )
    .min(1),
});

const systemPrompt = `You are a careful learning-path architect. Build a focused, personalized sequence from the supplied LMS catalog.

Use ONLY the courseId and sectionId values supplied in the catalog. Every sectionId must belong to its selected courseId. Do not invent lessons, resources, IDs, or claims about the learner.

Weighing the quiz: each question has a "tier" of level_beginner, level_intermediate, or level_advanced. A miss at a lower tier is a stronger signal of a foundational gap than a miss at a higher tier, even if overall score looks fine — prioritize fixing lower-tier misses before assigning advanced material. A learner who misses beginner-tier questions should not be routed straight to advanced sections just because they did well elsewhere.

completedSectionIds lists sections the learner has ALREADY passed. Do not include these in the plan at all, even as review, unless a completed section's underlying skill was clearly missed again in the current quiz — in that case you may re-include it once, with a reason explaining why it's a review rather than new material.

Use quiz misses (with their tier), skill confidence (0 = no experience, 10 = very confident), prerequisites, and course order to decide what to include. Include only the sections that will help this learner; place foundations before advanced work. Keep reasons concrete and brief.

Return ONLY valid JSON with this exact shape:
{"summary":"...","recommendedStartingPoint":"...","items":[{"courseId":"catalog course id","sectionId":"catalog section id or null","reason":"..."}]}`;

function parseModelJson(content) {
  const text = typeof content === "string" ? content : JSON.stringify(content);
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return aiPathSchema.parse(JSON.parse(cleaned));
}

function validateCatalogReferences(plan, catalog) {
  const courses = new Map(catalog.map((course) => [course.courseId, course]));
  const uniqueItems = new Map();

  for (const item of plan.items) {
    const course = courses.get(item.courseId);
    if (!course)
      throw new Error("AI returned a course outside this track's catalog.");
    if (
      item.sectionId &&
      !course.sections.some((section) => section.sectionId === item.sectionId)
    ) {
      throw new Error("AI returned a section outside its selected course.");
    }
    const key = `${item.courseId}:${item.sectionId ?? "all"}`;
    if (!uniqueItems.has(key)) uniqueItems.set(key, item);
  }

  if (!uniqueItems.size) throw new Error("AI returned an empty learning path.");
  return [...uniqueItems.values()];
}

export const getLearningPathForTrack = ({ userId, trackId }) =>
  findLearningPath({ userId, trackId });

export { findLearningPathTrackIds };

export const generateLearningPath = async ({ userId, slug, trackId }) => {
  const existing = await findLearningPath({ userId, trackId });
  if (existing) return { path: existing, created: false };

  const attempt = await findLatestAttemptForUserTrack({ userId, trackId });
  if (!attempt) {
    const error = new Error(
      "Complete the track quiz before generating a learning path.",
    );
    error.statusCode = 409;
    throw error;
  }
  if (!process.env.GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY is not configured on the server.");
    error.statusCode = 503;
    throw error;
  }

  const context = await buildAiContext({ userId, slug, attemptId: attempt.id });
  if (!context?.quiz)
    throw new Error("Could not build the required quiz context.");

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature: 0.2,
    maxTokens: 2200,
  });
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(
      `Learner and catalog context:\n${JSON.stringify(context)}`,
    ),
  ]);
  const plan = parseModelJson(response.content);
  const items = validateCatalogReferences(plan, context.catalog);

  try {
    const path = await createLearningPath({
      userId,
      trackId,
      items,
      summary: plan.summary,
      recommendedStartingPoint: plan.recommendedStartingPoint,
    });
    return { path, created: true };
  } catch (error) {
    // The unique key protects against two browser tabs generating simultaneously.
    if (error.code === "P2002") {
      return {
        path: await findLearningPath({ userId, trackId }),
        created: false,
      };
    }
    throw error;
  }
};

export const regenerateLearningPath = async ({ userId, slug, trackId }) => {
  console.log("[learning-path.service] regenerating path:", {
    userId,
    trackId,
  });
  await deleteLearningPath({ userId, trackId });
  return generateLearningPath({ userId, slug, trackId });
};
