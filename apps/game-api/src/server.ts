import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { smartInputRouter } from "./routes/smart-input";
import { storyGenerateRouter } from "./routes/story-generate";
import { attributesGenerateRouter } from "./routes/attributes-generate";
import { attributesBenchmarksRouter } from "./routes/attributes-benchmarks";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

  // Health check
  app.get("/api/health", (_, res) => {
    return res.json({ status: "ok" });
  });

  // API Routes
  app.use("/api/ai", smartInputRouter);
  app.use("/api/story", storyGenerateRouter);
  app.use("/api/attributes", attributesGenerateRouter);
  app.use("/api/attributes", attributesBenchmarksRouter);

  return app;
};
