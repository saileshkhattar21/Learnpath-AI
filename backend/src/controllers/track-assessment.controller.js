import { getAuth } from "@clerk/express";
import { findOrCreateUser } from "../services/user.service.js";
import { getTrackDetail } from "../services/track.service.js";
import {
  buildQuizForTrack,
  gradeAndSaveAttempt,
} from "../services/track-assessment.service.js";

export const getTrackQuiz = async (req, res) => {
  try {
    const { slug } = req.params;
    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const questions = await buildQuizForTrack(track.id);
    res.json({ trackId: track.id, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postTrackQuizSubmit = async (req, res) => {
  try {
    const { slug } = req.params;
    const { responses } = req.body;
    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);

    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const result = await gradeAndSaveAttempt({
      userId: user.id,
      trackId: track.id,
      responses,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
