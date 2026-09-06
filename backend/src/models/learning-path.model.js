import prisma from "../config/prisma.js";

const pathInclude = {
  items: {
    orderBy: { position: "asc" },
    include: {
      course: {
        select: { id: true, title: true, level: { select: { name: true } } },
      },
      section: { select: { id: true, title: true } },
    },
  },
};

export const findLearningPath = ({ userId, trackId }) =>
  prisma.learningPath.findUnique({
    where: { userId_trackId: { userId, trackId } },
    include: pathInclude,
  });

export const findLearningPathTrackIds = (userId) =>
  prisma.learningPath.findMany({ where: { userId }, select: { trackId: true } });

export const createLearningPath = ({
  userId,
  trackId,
  items,
  summary,
  recommendedStartingPoint,
}) =>
  prisma.learningPath.create({
    data: {
      userId,
      trackId,
      summary,
      recommendedStartingPoint,
      items: {
        create: items.map((item, index) => ({
          courseId: item.courseId,
          sectionId: item.sectionId ?? null,
          position: index + 1,
          reason: item.reason,
        })),
      },
    },
    include: pathInclude,
  });

export const deleteLearningPath = ({ userId, trackId }) =>
  prisma.learningPath
    .delete({ where: { userId_trackId: { userId, trackId } } })
    .catch((err) => {
      if (err.code === "P2025") return null; // nothing to delete, fine
      throw err;
    });

const studyInclude = {
  items: {
    orderBy: { position: "asc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          level: { select: { id: true, name: true, rank: true } },
        },
      },
      section: {
        include: { resources: true, videos: true },
      },
    },
  },
};

export const findLearningPathForStudy = ({ userId, trackId }) =>
  prisma.learningPath.findUnique({
    where: { userId_trackId: { userId, trackId } },
    include: studyInclude,
  });
