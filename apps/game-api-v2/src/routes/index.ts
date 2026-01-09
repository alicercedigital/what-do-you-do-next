import { Router } from "express";
import { gameRouter } from "./game";
import { momentsRouter } from "./moments";
import { challengesRouter } from "./challenges";
import { aiRouter } from "./ai";

const router = Router();

// Mount all route modules
router.use("/api", gameRouter);
router.use("/api", momentsRouter);
router.use("/api", challengesRouter);
router.use("/api/ai", aiRouter);

export { router as apiRouter };
