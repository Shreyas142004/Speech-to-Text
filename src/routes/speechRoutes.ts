import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { speechToText } from "../controllers/speechController";
import { translateText } from "../controllers/translateController";

const router = Router();

// Set up Multer for handling file uploads directly
// Note: __dirname is now src/routes, so uploads goes to root/uploads
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ✅ Route
router.post("/speech-to-text", upload.single("audio"), speechToText as any);
router.post("/translate", translateText as any);

export default router;
