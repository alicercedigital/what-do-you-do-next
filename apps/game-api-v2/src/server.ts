import { json, urlencoded } from "body-parser";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import * as path from "path";
import { apiRouter } from "./routes";

// Custom morgan token for colored status codes
morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  return `\x1b[32m${status}\x1b[0m`; // Green
});

// Skip logging for common 404s that are expected (e.g., stale game IDs)
const skipLog = (req: Request, res: Response) => {
  // Skip 404s on game endpoints - these are expected when games are deleted
  if (res.statusCode === 404 && req.path.startsWith("/api/game/")) {
    return true;
  }
  return false;
};

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan(":method :url :status-colored :response-time ms", { skip: skipLog }))
    .use(urlencoded({ extended: true }))
    .use(json({ limit: "10mb" })) // Larger limit for universe uploads
    .use(
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

  // Serve uploaded images
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Health check
  app.get("/api/health", (_, res) => {
    return res.json({ status: "ok", version: "v2" });
  });

  // API routes
  app.use(apiRouter);

  // Catch-all 404 handler for undefined routes
  app.use("/api/*", (req: Request, res: Response) => {
    return res.status(404).json({
      error: "Not found",
      path: req.path,
      method: req.method,
    });
  });

  // Global error handler - catches unhandled errors from routes
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    // Don't log stack traces for expected errors
    const isOperationalError = err.message.includes("not found") ||
                                err.message.includes("unauthorized") ||
                                err.message.includes("invalid");

    if (!isOperationalError) {
      console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
      if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
      }
    }

    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === "production" && !isOperationalError
      ? "Internal server error"
      : err.message;

    return res.status(500).json({ error: message });
  });

  return app;
};
