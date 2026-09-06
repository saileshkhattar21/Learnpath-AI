import { getTrackDetail, getTrackCatalog } from "./track.service.js";
import { getRatingsForTrack } from "./skill-rating.service.js";
import { getFullContextForAttempt } from "./track-assessment.service.js";
import { findCompletedSectionIdsForTrack } from "../models/user-section-progress.model.js";

export const buildAiContext = async ({ userId, slug, attemptId }) => {
  console.log(
    `[ai-context] building context for user=${userId} track=${slug} attempt=${attemptId}`,
  );

  const track = await getTrackDetail(slug);
  if (!track) {
    console.log("[ai-context] track not found:", slug);
    return null;
  }

  const catalog = await getTrackCatalog(track.id);
  console.log(`[ai-context] catalog: ${catalog.length} courses`);

  const ratings = await getRatingsForTrack(userId, track.id);
  console.log(`[ai-context] self-ratings: ${ratings.length}`);

  const quiz = attemptId ? await getFullContextForAttempt(attemptId) : null;
  if (quiz && quiz.trackId !== track.id) {
    throw new Error("The diagnostic quiz does not belong to this track.");
  }

  const completedSectionIds = await findCompletedSectionIdsForTrack(
    userId,
    track.id,
  );
  console.log(`[ai-context] completed sections: ${completedSectionIds.length}`);

  console.log(
    quiz
      ? `[ai-context] quiz: ${quiz.questionDetails.length} questions`
      : "[ai-context] no quiz attempt provided",
  );

  const context = {
    track: {
      id: track.id,
      name: track.name,
      description: track.description,
      prerequisites: track.prerequisites.map((prerequisite) => ({
        skillId: prerequisite.skillId,
        skillName: prerequisite.skill.name,
        importance: prerequisite.importance,
      })),
      trackSkills: track.skills.map(({ skill }) => ({
        skillId: skill.id,
        skillName: skill.name,
      })),
    },
    catalog,
    selfRatings: ratings.map((r) => ({
      skillId: r.skillId,
      skillName: r.skill.name,
      rating: r.rating,
    })),
    completedSectionIds,
    quiz,
  };

  console.log("[ai-context] context assembled");
  return context;
};
