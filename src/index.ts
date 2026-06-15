import "dotenv/config";
import express from "express";
import cors from "cors";
import speechRoutes from "./routes/speechRoutes";

/*
================================================================================
BACKEND ARCHITECTURE EXPLANATION:
1. THE SERVER: This file (index.ts) creates an Express.js server that listens on port 4000.
2. CORS: It uses the 'cors' package so our React frontend (running on port 5173) is allowed to talk to it.
3. ROUTES: It mounts all of our backend routes (like '/speech-to-text' and '/translate') from 'speechRoutes.ts'.
================================================================================
*/

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Mount routes
app.use("/", speechRoutes);

app.get("/", (req, res) => {
  res.send("Speech-to-text API running (Local Whisper Mode)");
});

app.listen(port, () => {
  console.log(`Server running on port ${port} (Local Whisper Mode)`);
});