import { findOrCreateUser } from "../services/user.service.js";

export const getCurrentUser = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const user = await findOrCreateUser(clerkUserId);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
