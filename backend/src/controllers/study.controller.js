import { getAuth } from "@clerk/express";
import { findOrCreateUser } from "../services/user.service.js";
import { getTrackDetail } from "../services/track.service.js";
import { buildStudyView } from "../services/study.service.js";
import { getLearningPathForTrack } from "../services/learning-path.service.js";

export const getTrackStudy = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("[GET /tracks/:slug/study] slug:", slug);

    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);

    const track = await getTrackDetail(slug);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const study = await buildStudyView({ userId: user.id, trackId: track.id });
    if (!study)
      return res
        .status(404)
        .json({ error: "No learning path found for this track yet." });

    const path = await getLearningPathForTrack({ userId: user.id, trackId: track.id });
    res.json({ study, path });
  } catch (err) {
    console.error("[GET /tracks/:slug/study] failed:", err);
    res.status(500).json({ error: err.message });
  }
};
