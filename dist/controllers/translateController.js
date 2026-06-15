"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const translateText = (req, res) => {
    // STEP 1: Grab the original text and the target language that the React frontend sent us.
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Missing text or targetLanguage" });
    }
    // We need to run a separate Python script because the 'deep-translator' package is in Python, not Node.js.
    const scriptPath = path_1.default.resolve(process.cwd(), 'src', 'translate.py');
    // STEP 2: We open a "child process" (a hidden terminal inside our server).
    // We run the command: `python src/translate.py <targetLanguage>`
    const pyProcess = (0, child_process_1.spawn)('python', [scriptPath, targetLanguage], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });
    let outputLog = '';
    let errorLog = '';
    // STEP 3: We securely pass the text into the Python script's standard input stream (stdin).
    // We do it this way instead of passing it as a command line argument so we don't hit length limits!
    pyProcess.stdin.write(text);
    pyProcess.stdin.end();
    pyProcess.stdout.on('data', (data) => {
        // STEP 4: As the Python script prints the translated text, we capture it here.
        outputLog += data.toString('utf8');
    });
    pyProcess.stderr.on('data', (data) => {
        errorLog += data.toString('utf8');
    });
    pyProcess.on('close', (code) => {
        // STEP 5: The Python script finishes. If successful (code === 0), we send it back to React!
        if (code === 0) {
            res.json({ success: true, translatedText: outputLog.trim() });
        }
        else {
            console.error("Translation error:", errorLog);
            res.status(500).json({
                error: 'Translation failed.',
                details: errorLog
            });
        }
    });
};
exports.translateText = translateText;
