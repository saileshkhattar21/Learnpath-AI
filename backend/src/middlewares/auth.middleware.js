import { getAuth } from "@clerk/express";

export const requireAuthJson = (req, res, next) => {
  const auth = getAuth(req);
  console.log("[auth] userId:", auth.userId);

  if (!auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};
