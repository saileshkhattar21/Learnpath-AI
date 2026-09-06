import prisma from "../config/prisma.js";

export const upsertRating = async ({ userId, skillId, rating }) => {
  return prisma.userSkillRating.upsert({
    where: { userId_skillId: { userId, skillId } },
    update: { rating },
    create: { userId, skillId, rating },
  });
};

export const findRatingsForUserByTrack = async (userId, trackId) => {
  return prisma.userSkillRating.findMany({
    where: {
      userId,
      skill: {
        OR: [
          { tracks: { some: { trackId } } },
          { prerequisites: { some: { trackId } } },
        ],
      },
    },
    include: { skill: true },
  });
};
