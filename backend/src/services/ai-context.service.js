import { getTrackDetail, getTrackCatalog } from "./track.service.js";
import { getRatingsForTrack } from "./skill-rating.service.js";
import { getFullContextForAttempt } from "./track-assessment.service.js";
import { findCompletedSectionIdsForTrack } from "../models/user-section-progress.model.js";

export const buildAiContext = async ({ userId, slug, attemptId }) => {
  const track = await getTrackDetail(slug);
  if (!track) {
    return null;
  }

  const catalog = await getTrackCatalog(track.id);
  const ratings = await getRatingsForTrack(userId, track.id);

  const quiz = attemptId ? await getFullContextForAttempt(attemptId) : null;
  if (quiz && quiz.trackId !== track.id) {
    throw new Error("The diagnostic quiz does not belong to this track.");
  }

  const completedSectionIds = await findCompletedSectionIdsForTrack(
    userId,
    track.id,
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

  return context;
};
