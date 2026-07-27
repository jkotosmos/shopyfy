import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { startInstall, completeInstall } from "./shopifyAuth.js";
import { publishStore } from "./routes/publishStore.js";

const app = express();
app.use(cors({ origin: env.appUrl }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// OAuth: connect a seller's Shopify account.
app.get("/auth", startInstall);
app.get("/auth/callback", completeInstall);

// Publish an AI-generated store as a real (draft) product listing in the
// connected Shopify store.
app.post("/api/stores/publish", publishStore);

app.listen(env.port, () => {
  console.log(`Shopyfy backend listening on http://localhost:${env.port}`);
  console.log(`Public HOST configured as: ${env.host}`);
});
