import {
  upsertRating,
  findRatingsForUserByTrack,
} from "../models/user-skill-rating.model.js";

export const saveRatings = async (userId, ratings) => {
  const saved = [];
  for (const { skillId, rating } of ratings) {
    const result = await upsertRating({ userId, skillId, rating });
    saved.push(result);
  }
  return saved;
};

export const getRatingsForTrack = async (userId, trackId) => {
  return findRatingsForUserByTrack(userId, trackId);
};
