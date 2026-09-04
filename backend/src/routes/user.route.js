import express from "express";
import { requireAuthJson } from "../middlewares/auth.middleware.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", requireAuthJson, getCurrentUser);

export default router;
