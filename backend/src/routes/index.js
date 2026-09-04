import express from "express";
import healthRoutes from "./health.route.js";
import userRoutes from "./user.route.js";

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);

export default router;
