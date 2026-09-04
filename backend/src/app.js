import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
