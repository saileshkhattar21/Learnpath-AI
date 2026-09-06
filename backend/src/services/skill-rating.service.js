import {
  upsertRating,
  findRatingsForUserByTrack,
} from "../models/user-skill-rating.model.js";

export const saveRatings = async (userId, ratings) => {
  console.log(
    `[skill-rating.service] saving ${ratings.length} ratings for user:`,
    userId,
  );
  const saved = [];
  for (const { skillId, rating } of ratings) {
    const result = await upsertRating({ userId, skillId, rating });
    saved.push(result);
  }
  console.log("[skill-rating.service] done:", saved.length);
  return saved;
};

export const getRatingsForTrack = async (userId, trackId) => {
  console.log("[skill-rating.service] fetching ratings for track:", trackId);
  return findRatingsForUserByTrack(userId, trackId);
};
