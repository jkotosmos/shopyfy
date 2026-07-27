import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./env.js";
import { startInstall, completeInstall } from "./shopifyAuth.js";
import { publishStore } from "./routes/publishStore.js";
import { asyncHandler } from "./asyncHandler.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.appUrl }));
app.use(express.json({ limit: "256kb" }));

// This backend doesn't run behind a shared load balancer that would spread
// abusive traffic across instances, so a simple in-memory limiter is enough
// here — swap for a store-backed limiter (Redis) if you deploy more than
// one instance.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const publishLimiter = rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

app.get("/health", (_req, res) => res.json({ ok: true }));

// OAuth: connect a seller's Shopify account.
app.get("/auth", authLimiter, startInstall);
app.get("/auth/callback", authLimiter, asyncHandler(completeInstall));

// Publish an AI-generated store as a real (draft) product listing in the
// connected Shopify store.
app.post("/api/stores/publish", publishLimiter, asyncHandler(publishStore));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled request error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error." });
});

app.listen(env.port, () => {
  console.log(`Shopyfy backend listening on http://localhost:${env.port}`);
  console.log(`Public HOST configured as: ${env.host}`);
});
