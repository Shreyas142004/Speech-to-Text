"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const speechController_1 = require("../controllers/speechController");
const translateController_1 = require("../controllers/translateController");
const router = (0, express_1.Router)();
// ==============================================================================
// STEP 1: Setting up Multer (The File Catcher)
// When the React frontend sends an audio file, Express doesn't know how to handle
// files natively. Multer is a helper that catches the file from the incoming request.
// ==============================================================================
// We tell Multer where to save the files (the "uploads" folder in the root directory).
const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
// We tell Multer exactly how to name the files so they don't overwrite each other.
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save it here
    },
    filename: (req, file, cb) => {
        // Generate a random unique name, like: audio-16382039.webm
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// ==============================================================================
// STEP 2: Creating the API Routes (The Doors to our Backend)
// ==============================================================================
// Door #1: '/speech-to-text'
// When the frontend knocks on this door, 'upload.single("audio")' catches the file,
// saves it to disk, and THEN passes control to our 'speechToText' controller logic.
router.post("/speech-to-text", upload.single("audio"), speechController_1.speechToText);
// Door #2: '/translate'
// When the frontend knocks on this door, it just hands over the text to the 
// 'translateText' controller to run the Python translation script.
router.post("/translate", translateController_1.translateText);
exports.default = router;
