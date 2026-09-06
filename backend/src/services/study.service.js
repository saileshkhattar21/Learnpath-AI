import { findLearningPathForStudy } from "../models/learning-path.model.js";
import { findProgressForSections } from "../models/user-section-progress.model.js";

function extractYoutubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export const buildStudyView = async ({ userId, trackId }) => {
  const path = await findLearningPathForStudy({ userId, trackId });
  if (!path) return null;

  const sectionIds = path.items
    .filter((i) => i.section)
    .map((i) => i.section.id);
  const progressMap = await findProgressForSections(userId, sectionIds);

  // Group path items by level rank, preserving the AI's chosen order within each level.
  const levelsByRank = new Map();
  for (const item of path.items) {
    const level = item.course.level;
    if (!levelsByRank.has(level.rank)) {
      levelsByRank.set(level.rank, {
        levelId: level.id,
        levelName: level.name,
        rank: level.rank,
        items: [],
      });
    }

    const progress = item.section ? progressMap[item.section.id] : null;

    levelsByRank.get(level.rank).items.push({
      id: item.id,
      position: item.position,
      reason: item.reason,
      course: { id: item.course.id, title: item.course.title },
      section: item.section
        ? {
            id: item.section.id,
            title: item.section.title,
            description: item.section.description,
            learningObjectives: item.section.learningObjectives,
            resources: item.section.resources,
            videos: item.section.videos.map((v) => ({
              ...v,
              youtubeId: extractYoutubeId(v.url),
            })),
          }
        : null,
      progress: {
        completed: progress?.completed ?? false,
        bestScore: progress?.bestScore ?? null,
        attempts: progress?.attempts ?? 0,
      },
    });
  }

  const levels = [...levelsByRank.values()].sort((a, b) => a.rank - b.rank);

  // First level always unlocked; each next level unlocks only once every
  // section in the previous level is completed. Sections WITHIN an
  // unlocked level are never locked relative to each other.
  let previousComplete = true;
  for (const level of levels) {
    level.unlocked = previousComplete;
    level.completed = level.items.every(
      (i) => !i.section || i.progress.completed,
    );
    previousComplete = level.completed;
  }

  return {
    learningPathId: path.id,
    summary: path.summary,
    recommendedStartingPoint: path.recommendedStartingPoint,
    levels,
  };
};
