import dotenv from "dotenv";
dotenv.config();

export const clerkSecretKey = process.env.CLERK_SECRET_KEY;
export const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
