import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { apiRouter } from "./routes";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json({ limit: "10mb" })) // Larger limit for universe uploads
    .use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

  // Health check
  app.get("/api/health", (_, res) => {
    return res.json({ status: "ok", version: "v2" });
  });

  // API routes
  app.use(apiRouter);

  return app;
};
