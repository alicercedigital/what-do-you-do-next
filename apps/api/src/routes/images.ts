import { Router } from "express";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";

const router = Router();

// Image metadata type
interface ImageMetadata {
  id: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  uploadedAt: number;
  filename: string;
  type: "character" | "location" | "item" | "general";
  universeId: string;
}

// In-memory storage for image metadata (in production, use a database)
const imageStore = new Map<string, ImageMetadata>();

// Uploads directory
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const universeId = req.body.universeId || "default";
    const universeDir = path.join(UPLOADS_DIR, universeId);

    if (!fs.existsSync(universeDir)) {
      fs.mkdirSync(universeDir, { recursive: true });
    }

    cb(null, universeDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * List images for a universe
 * GET /api/images?universeId=xxx
 */
router.get("/", (req, res) => {
  const { universeId } = req.query;

  if (!universeId || typeof universeId !== "string") {
    return res.status(400).json({ error: "universeId is required" });
  }

  const images = Array.from(imageStore.values())
    .filter((img) => img.universeId === universeId)
    .sort((a, b) => b.uploadedAt - a.uploadedAt);

  return res.json({ images });
});

/**
 * Upload an image
 * POST /api/images
 */
router.post("/", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    const { universeId, type, tags } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!universeId) {
      return res.status(400).json({ error: "universeId is required" });
    }

    const imageType = type || "general";
    const imageTags: string[] = tags ? JSON.parse(tags) : [];

    const imageId = randomUUID();
    const imageUrl = `/uploads/${universeId}/${file.filename}`;

    const metadata: ImageMetadata = {
      id: imageId,
      url: imageUrl,
      tags: imageTags,
      uploadedAt: Date.now(),
      filename: file.originalname,
      type: imageType,
      universeId,
    };

    imageStore.set(imageId, metadata);

    return res.json({ image: metadata });
  } catch (error) {
    console.error("Image upload failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
});

/**
 * Delete an image
 * DELETE /api/images/:id
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const image = imageStore.get(id);
  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  // Delete file from filesystem
  const filePath = path.join(UPLOADS_DIR, image.universeId, path.basename(image.url));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Delete thumbnail if exists
  if (image.thumbnailUrl) {
    const thumbPath = path.join(
      UPLOADS_DIR,
      image.universeId,
      "thumbs",
      path.basename(image.thumbnailUrl)
    );
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
  }

  imageStore.delete(id);

  return res.json({ success: true });
});

/**
 * Update image tags
 * PATCH /api/images/:id/tags
 */
router.patch("/:id/tags", (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  const image = imageStore.get(id);
  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: "tags must be an array" });
  }

  image.tags = tags;
  imageStore.set(id, image);

  return res.json({ image });
});

/**
 * Generate character image (placeholder - returns mock URL)
 * POST /api/ai/generate-image/character
 */
router.post("/ai/generate-image/character", async (req, res) => {
  try {
    const { characterName, emotion, artStyle } = req.body;

    // Placeholder implementation - in production, integrate with image generation API
    // Returns a placeholder image URL
    const placeholderUrl = `https://placehold.co/512x512/2a2a3e/9ca3af?text=${encodeURIComponent(
      `${characterName || "Character"}\n${emotion || "neutral"}\n${artStyle || "anime"}`
    )}`;

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return res.json({ imageUrl: placeholderUrl });
  } catch (error) {
    console.error("Character image generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate location image (placeholder - returns mock URL)
 * POST /api/ai/generate-image/location
 */
router.post("/ai/generate-image/location", async (req, res) => {
  try {
    const { locationName, artStyle, timeOfDay } = req.body;

    // Placeholder implementation
    const placeholderUrl = `https://placehold.co/1024x576/1a3a2e/9ca3af?text=${encodeURIComponent(
      `${locationName || "Location"}\n${timeOfDay || "day"}\n${artStyle || "painted"}`
    )}`;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return res.json({ imageUrl: placeholderUrl });
  } catch (error) {
    console.error("Location image generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

/**
 * Generate item image (placeholder - returns mock URL)
 * POST /api/ai/generate-image/item
 */
router.post("/ai/generate-image/item", async (req, res) => {
  try {
    const { itemName, artStyle, rarity } = req.body;

    // Placeholder implementation
    const placeholderUrl = `https://placehold.co/256x256/3e2a2a/9ca3af?text=${encodeURIComponent(
      `${itemName || "Item"}\n${rarity || "common"}\n${artStyle || "icon"}`
    )}`;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return res.json({ imageUrl: placeholderUrl });
  } catch (error) {
    console.error("Item image generation failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }
});

export { router as imagesRouter };
