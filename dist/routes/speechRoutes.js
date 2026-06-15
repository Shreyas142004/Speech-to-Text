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
// Set up Multer for handling file uploads directly
// Note: __dirname is now src/routes, so uploads goes to root/uploads
const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// ✅ Route
router.post("/speech-to-text", upload.single("audio"), speechController_1.speechToText);
router.post("/translate", translateController_1.translateText);
exports.default = router;
