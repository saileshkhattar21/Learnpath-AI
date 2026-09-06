import {
  findAllTracks,
  findTrackBySlug,
  findTrackCatalog,
} from "../models/track.model.js";

export const listTracks = async () => {
  return findAllTracks();
};

export const getTrackDetail = async (slug) => {
  return findTrackBySlug(slug);
};

export const getTrackCatalog = async (trackId) => {
  const courses = await findTrackCatalog(trackId);

  const catalog = courses.map((course) => ({
    courseId: course.id,
    level: course.level.name,
    levelRank: course.level.rank,
    courseOrder: course.displayOrder,
    title: course.title,
    description: course.description,
    sections: course.sections.map((section) => ({
      sectionId: section.id,
      title: section.title,
      description: section.description,
      sectionOrder: section.displayOrder,
      skills: section.skills.map((s) => s.skill.name),
    })),
  }));

  return catalog;
};
