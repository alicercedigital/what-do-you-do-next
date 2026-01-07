import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { smartInput } from "./routes/smart-input"
import { storyGenerate } from "./routes/story-generate"
import { attributesGenerate } from "./routes/attributes-generate"
import { attributesBenchmarks } from "./routes/attributes-benchmarks"

const app = new Hono()

// CORS for Vite dev server
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
)

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }))

// API Routes
app.route("/api/ai", smartInput)
app.route("/api/story", storyGenerate)
app.route("/api/attributes", attributesGenerate)
app.route("/api/attributes", attributesBenchmarks)

const port = 3001
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
