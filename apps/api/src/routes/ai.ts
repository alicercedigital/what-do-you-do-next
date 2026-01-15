import { Router, Response } from "express";
import { getGame } from "../storage";
import {
  evaluateCondition,
  evaluateConditions,
  generateMoment,
  generateMomentOptions,
  expandMomentText,
  isAIConfigured,
} from "../ai";
import {
  optionalAuth,
  loadProfile,
  deductCredits,
  type AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

// Apply optional auth to all routes to identify users for credit deduction
router.use(optionalAuth);
router.use(loadProfile);

// Credit costs for different AI operations
const CREDIT_COSTS = {
  evaluateCondition: 1,
  evaluateConditions: 1, // Per condition
  generateMoment: 5,
  generateOptions: 3,
  expandMoment: 2,
  fillGap: 5,
};

/**
 * Check if user can use their own API key (bypasses credits)
 */
function hasOwnApiKey(req: AuthenticatedRequest): boolean {
  return Boolean(req.user?.profile?.openrouter_api_key);
}

/**
 * Deduct credits from user after AI usage
 */
async function chargeCredits(
  req: AuthenticatedRequest,
  res: Response,
  cost: number,
  description: string
): Promise<boolean> {
  // Skip charging if user has their own API key
  if (hasOwnApiKey(req)) {
    return true;
  }

  // Skip charging if no user (anonymous/dev mode)
  if (!req.user?.id) {
    return true;
  }

  // Check balance
  const balance = req.user.profile?.ai_credits ?? 0;
  if (balance < cost) {
    res.status(402).json({
      error: "Insufficient credits",
      required: cost,
      available: balance,
    });
    return false;
  }

  // Note: Credits are deducted after successful operation
  // This is a pre-check only
  return true;
}

/**
 * Deduct credits after successful AI call
 */
async function finalizeCharge(
  req: AuthenticatedRequest,
  cost: number,
  description: string
): Promise<void> {
  if (hasOwnApiKey(req) || !req.user?.id) {
    return;
  }

  await deductCredits(req.user.id, cost, "ai_usage", description);
}

/**
 * Check AI availability
 * GET /api/ai/status
 */
router.get("/status", (_req, res) => {
  return res.json({
    available: isAIConfigured(),
    message: isAIConfigured()
      ? "AI is configured and ready"
      : "No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY",
  });
});

/**
 * Evaluate an AI condition
 * POST /api/ai/evaluate-condition
 *
 * Body: { hint: string, gameId: string, momentId?: string }
 */
router.post("/evaluate-condition", async (req: AuthenticatedRequest, res) => {
  const cost = CREDIT_COSTS.evaluateCondition;

  // Pre-check credits
  if (!(await chargeCredits(req, res, cost, "AI condition evaluation"))) {
    return;
  }

  try {
    const { hint, gameId, momentId } = req.body;

    if (!hint || typeof hint !== "string") {
      return res.status(400).json({ error: "hint is required" });
    }

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const result = await evaluateCondition({
      hint,
      gameState: game.state,
      momentId,
    });

    // Charge credits after successful operation
    await finalizeCharge(req, cost, "AI condition evaluation");

    return res.json(result);
  } catch (error) {
    console.error("Condition evaluation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Evaluation failed",
    });
  }
});

/**
 * Evaluate multiple AI conditions
 * POST /api/ai/evaluate-conditions
 *
 * Body: { conditions: Array<{ hint: string, momentId?: string }>, gameId: string }
 */
router.post("/evaluate-conditions", async (req: AuthenticatedRequest, res) => {
  try {
    const { conditions, gameId } = req.body;

    if (!Array.isArray(conditions)) {
      return res.status(400).json({ error: "conditions array is required" });
    }

    const cost = CREDIT_COSTS.evaluateConditions * conditions.length;

    // Pre-check credits
    if (!(await chargeCredits(req, res, cost, "AI conditions evaluation"))) {
      return;
    }

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const requests = conditions.map((c: { hint: string; momentId?: string }) => ({
      hint: c.hint,
      gameState: game.state,
      momentId: c.momentId,
    }));

    const results = await evaluateConditions(requests);

    // Charge credits after successful operation
    await finalizeCharge(req, cost, "AI conditions evaluation");

    return res.json({ results });
  } catch (error) {
    console.error("Conditions evaluation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Evaluation failed",
    });
  }
});

/**
 * Generate a moment
 * POST /api/ai/generate-moment
 *
 * Body: {
 *   gameId: string,
 *   context?: string,
 *   momentType?: "transition" | "gap-fill" | "consequence",
 *   locationId?: string
 * }
 */
router.post("/generate-moment", async (req: AuthenticatedRequest, res) => {
  const cost = CREDIT_COSTS.generateMoment;

  // Pre-check credits
  if (!(await chargeCredits(req, res, cost, "AI moment generation"))) {
    return;
  }

  try {
    const { gameId, context, momentType, locationId } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const moment = await generateMoment({
      gameState: game.state,
      universe: game.universe,
      context,
      momentType,
      locationId,
    });

    if (!moment) {
      return res.status(500).json({ error: "Failed to generate moment" });
    }

    // Charge credits after successful operation
    await finalizeCharge(req, cost, "AI moment generation");

    return res.json({ moment });
  } catch (error) {
    console.error("Moment generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate multiple moment options
 * POST /api/ai/generate-options
 *
 * Body: {
 *   gameId: string,
 *   count?: number,
 *   context?: string
 * }
 */
router.post("/generate-options", async (req: AuthenticatedRequest, res) => {
  const cost = CREDIT_COSTS.generateOptions;

  // Pre-check credits
  if (!(await chargeCredits(req, res, cost, "AI options generation"))) {
    return;
  }

  try {
    const { gameId, count = 3, context } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const options = await generateMomentOptions(
      {
        gameState: game.state,
        universe: game.universe,
        context,
      },
      Math.min(count, 5) // Cap at 5 options
    );

    // Charge credits after successful operation
    await finalizeCharge(req, cost, "AI options generation");

    return res.json({ options });
  } catch (error) {
    console.error("Options generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Expand a brief moment into full narrative
 * POST /api/ai/expand-moment
 *
 * Body: {
 *   gameId: string,
 *   moment: { title: string, text?: string, preview?: string }
 * }
 */
router.post("/expand-moment", async (req: AuthenticatedRequest, res) => {
  const cost = CREDIT_COSTS.expandMoment;

  // Pre-check credits
  if (!(await chargeCredits(req, res, cost, "AI moment expansion"))) {
    return;
  }

  try {
    const { gameId, moment } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    if (!moment || !moment.title) {
      return res.status(400).json({ error: "moment with title is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const expandedText = await expandMomentText(
      moment,
      game.universe,
      game.state
    );

    if (!expandedText) {
      return res.status(500).json({ error: "Failed to expand moment" });
    }

    // Charge credits after successful operation
    await finalizeCharge(req, cost, "AI moment expansion");

    return res.json({ text: expandedText });
  } catch (error) {
    console.error("Moment expansion failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Expansion failed",
    });
  }
});

/**
 * Fill a narrative gap with AI-generated content
 * POST /api/ai/fill-gap
 *
 * Body: {
 *   gameId: string,
 *   context?: string
 * }
 */
router.post("/fill-gap", async (req: AuthenticatedRequest, res) => {
  const cost = CREDIT_COSTS.fillGap;

  // Pre-check credits
  if (!(await chargeCredits(req, res, cost, "AI gap filling"))) {
    return;
  }

  try {
    const { gameId, context } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: "gameId is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const moment = await generateMoment({
      gameState: game.state,
      universe: game.universe,
      context,
      momentType: "gap-fill",
    });

    if (!moment) {
      return res.status(500).json({ error: "Failed to fill gap" });
    }

    // Charge credits after successful operation
    await finalizeCharge(req, cost, "AI gap filling");

    return res.json({ moment });
  } catch (error) {
    console.error("Gap filling failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Gap filling failed",
    });
  }
});

export { router as aiRouter };
