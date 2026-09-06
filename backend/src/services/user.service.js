import { findById, create } from "../models/user.model.js";

export const findOrCreateUser = async (clerkUserId) => {
  console.log("[user.service] looking up:", clerkUserId);
  let user = await findById(clerkUserId);

  if (!user) {
    console.log("[user.service] not found, creating:", clerkUserId);
    user = await create(clerkUserId);
    console.log("[user.service] created:", user);
  }

  return user;
};
