import { Router } from "express";
import { gameRouter } from "./game";
import { momentsRouter } from "./moments";
import { challengesRouter } from "./challenges";
import { aiRouter } from "./ai";
import { editorAIRouter } from "./editor-ai";
import { helperAIRouter } from "./helper-ai";
import { imagesRouter } from "./images";
import { marketplaceRouter } from "./marketplace";
import { socialRouter } from "./social";
import { savesRouter } from "./saves";
import { economyRouter } from "./economy";
import { analyticsRouter } from "./analytics";
import { badgesRouter } from "./badges";
import { stripeRouter } from "./stripe";
import { adminRouter } from "./admin";

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
router.use("/api/social", socialRouter);
router.use("/api/saves", savesRouter);
router.use("/api/economy", economyRouter);
router.use("/api/analytics", analyticsRouter);
router.use("/api/badges", badgesRouter);
router.use("/api/stripe", stripeRouter);
router.use("/api", adminRouter);

export { router as apiRouter };
