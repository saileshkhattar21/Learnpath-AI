import {
  findAllTracks,
  findTrackBySlug,
  findTrackCatalog,
} from "../models/track.model.js";

export const listTracks = async () => {
  console.log("[track.service] fetching all tracks");
  const tracks = await findAllTracks();
  console.log(`[track.service] found ${tracks.length} tracks`);
  return tracks;
};

export const getTrackDetail = async (slug) => {
  console.log("[track.service] fetching track:", slug);
  const track = await findTrackBySlug(slug);
  if (!track) console.log("[track.service] no track for slug:", slug);
  return track;
};

export const getTrackCatalog = async (trackId) => {
  console.log("[track.service] building catalog for track:", trackId);
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

  console.log(
    `[track.service] catalog: ${catalog.length} courses, ${catalog.reduce((n, c) => n + c.sections.length, 0)} sections`,
  );
  return catalog;
};
