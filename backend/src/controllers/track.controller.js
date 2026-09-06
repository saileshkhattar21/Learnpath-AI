import { getAuth } from "@clerk/express";
import { listTracks, getTrackDetail } from "../services/track.service.js";
import {
  saveRatings,
  getRatingsForTrack,
} from "../services/skill-rating.service.js";
import { findOrCreateUser } from "../services/user.service.js";
import {
  generateLearningPath,
  getLearningPathForTrack,
  regenerateLearningPath,
  findLearningPathTrackIds,
} from "../services/learning-path.service.js";
import { findLatestAttemptForUserTrack } from "../models/track-assessment.model.js";

export const getTracks = async (req, res) => {
  try {
    const tracks = await listTracks();
    const user = await findOrCreateUser(getAuth(req).userId);
    const paths = await findLearningPathTrackIds(user.id);
    const trackIdsWithPaths = new Set(paths.map((path) => path.trackId));
    res.json({
      tracks: tracks.map((track) => ({
        ...track,
        hasLearningPath: trackIdsWithPaths.has(track.id),
      })),
    });
  } catch (err) {
    console.error("[GET /tracks] failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTrack = async (req, res) => {
  try {
    const { slug } = req.params;
    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);
    const ratings = await getRatingsForTrack(user.id, track.id);
    const learningPath = await getLearningPathForTrack({
      userId: user.id,
      trackId: track.id,
    });
    const latestAttempt = await findLatestAttemptForUserTrack({
      userId: user.id,
      trackId: track.id,
    });

    res.json({
      track,
      ratings,
      learningPath,
      hasCompletedQuiz: Boolean(latestAttempt),
    });
  } catch (err) {
    console.error("[GET /tracks/:slug] failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const postTrackSkillRatings = async (req, res) => {
  try {
    const clerkUserId = getAuth(req).userId;
    console.log("[POST /tracks/:slug/skills] clerkUserId:", clerkUserId);
    const user = await findOrCreateUser(clerkUserId);

    const { ratings } = req.body;
    if (
      !Array.isArray(ratings) ||
      ratings.some(
        ({ skillId, rating }) =>
          !skillId || !Number.isInteger(rating) || rating < 0 || rating > 10,
      )
    ) {
      return res
        .status(400)
        .json({ error: "Ratings must be whole numbers from 0 to 10." });
    }
    const saved = await saveRatings(user.id, ratings);

    res.json({ ratings: saved });
  } catch (err) {
    console.error("[POST /tracks/:slug/skills] failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const postGenerateLearningPath = async (req, res) => {
  try {
    const { slug } = req.params;
    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);
    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const result = await generateLearningPath({
      userId: user.id,
      slug,
      trackId: track.id,
    });
    res.status(result.created ? 201 : 200).json(result);
  } catch (err) {
    console.error("[POST /tracks/:slug/path] failed:", err);
    res
      .status(err.statusCode || 500)
      .json({ error: err.message || "Could not generate learning path." });
  }
};

export const postRegenerateLearningPath = async (req, res) => {
  try {
    const { slug } = req.params;
    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);
    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const result = await regenerateLearningPath({
      userId: user.id,
      slug,
      trackId: track.id,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error("[POST /tracks/:slug/path/regenerate] failed:", err);
    res
      .status(err.statusCode || 500)
      .json({ error: err.message || "Could not regenerate learning path." });
  }
};
