"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const speechRoutes_1 = __importDefault(require("./routes/speechRoutes"));
/*
================================================================================
BACKEND ARCHITECTURE EXPLANATION:
1. THE SERVER: This file (index.ts) creates an Express.js server that listens on port 4000.
2. CORS: It uses the 'cors' package so our React frontend (running on port 5173) is allowed to talk to it.
3. ROUTES: It mounts all of our backend routes (like '/speech-to-text' and '/translate') from 'speechRoutes.ts'.
================================================================================
*/
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
// Mount routes
app.use("/", speechRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Speech-to-text API running (Local Whisper Mode)");
});
app.listen(port, () => {
    console.log(`Server running on port ${port} (Local Whisper Mode)`);
});
