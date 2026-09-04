import { clerkClient } from "@clerk/express";
import { findByAuthProviderId, create } from "../models/user.model.js";

export const findOrCreateUser = async (clerkUserId) => {
  let user = await findByAuthProviderId(clerkUserId);
  if (user) return user;

  // First time we've seen this Clerk session — pull profile details from
  // Clerk so the local record isn't just a bare id.
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  user = await create({
    auth_provider_id: clerkUserId,
    name,
    email: primaryEmail,
  });

  return user;
};
