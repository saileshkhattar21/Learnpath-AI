import { findById, create } from "../models/user.model.js";

export const findOrCreateUser = async (clerkUserId) => {
  let user = await findById(clerkUserId);

  if (!user) {
    user = await create(clerkUserId);
  }

  return user;
};
