import { getAuth } from "@clerk/express";
import { findOrCreateUser } from "../services/user.service.js";

export const getCurrentUser = async (req, res) => {
  try {
    const clerkUserId = getAuth(req).userId;
    const user = await findOrCreateUser(clerkUserId);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
