import { Router } from "express";
import { gameRouter } from "./game";
import { momentsRouter } from "./moments";
import { challengesRouter } from "./challenges";
import { aiRouter } from "./ai";
import { editorAIRouter } from "./editor-ai";
import { helperAIRouter } from "./helper-ai";
import { imagesRouter } from "./images";
import { marketplaceRouter } from "./marketplace";

const router = Router();

// Mount all route modules
router.use("/api", gameRouter);
router.use("/api", momentsRouter);
router.use("/api", challengesRouter);
router.use("/api/ai", aiRouter);
router.use("/api/editor/ai", editorAIRouter);
router.use("/api/editor/ai/helper", helperAIRouter);
router.use("/api/images", imagesRouter);
router.use("/api", imagesRouter); // Also mount for /api/ai/generate-image/* routes
router.use("/api/marketplace", marketplaceRouter);

export { router as apiRouter };
