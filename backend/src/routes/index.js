import express from "express";
import healthRoutes from "./health.route.js";
import userRoutes from "./user.route.js";
import trackRoutes from "./track.route.js";
import testRoutes from "./test.route.js";

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);
router.use("/tracks", trackRoutes);
if (process.env.NODE_ENV !== "production") {
  router.use("/test", testRoutes);
  console.log("[routes] test routes mounted at /api/test");
}

export default router;
