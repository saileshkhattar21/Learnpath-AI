import prisma from "../config/prisma.js";

export const findAllTracks = async () => {
  return prisma.track.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { courses: true } },
    },
  });
};

export const findTrackBySlug = async (slug) => {
  return prisma.track.findUnique({
    where: { slug },
    include: {
      prerequisites: { include: { skill: true } },
      skills: { include: { skill: true } },
    },
  });
};

export const findTrackCatalog = async (trackId) => {
  return prisma.course.findMany({
    where: { trackId },
    orderBy: [{ level: { rank: "asc" } }, { displayOrder: "asc" }],
    include: {
      level: { select: { id: true, name: true, rank: true } },
      sections: {
        orderBy: { displayOrder: "asc" },
        include: {
          skills: { include: { skill: { select: { id: true, name: true } } } },
        },
      },
    },
  });
};
