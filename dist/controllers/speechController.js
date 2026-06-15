"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.speechToText = void 0;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
// HOW THE BACKEND CONNECTS TO THE AI:
// We use the OpenAI software library, but we point it to "Groq".
// Groq provides a lightning-fast "Whisper" model that processes audio into text almost instantly.
// The Groq API key is securely loaded from our .env file.
const openai = new openai_1.default({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});
const speechToText = async (req, res) => {
    // STEP 1: Multer has already run and attached the uploaded file to 'req.file'.
    // If no file is attached, we throw an error back to the frontend.
    if (!req.file) {
        return res.status(400).json({ error: "No audio file provided." });
    }
    const audioPath = req.file.path; // Where the audio file is temporarily stored on our server
    const requestedLanguage = req.body.language; // What language the user wants (e.g. "en", "hi", "kn", "auto")
    console.log(`Starting Groq API transcription for ${audioPath} (Language: ${requestedLanguage || 'auto'})`);
    try {
        // STEP 2: We prepare the instructions for Groq's AI.
        // We pass it the file we just saved, and tell it to use the "whisper-large-v3" AI model.
        const options = {
            file: fs_1.default.createReadStream(audioPath),
            model: "whisper-large-v3",
            temperature: 0.0,
        };
        if (requestedLanguage && requestedLanguage !== 'auto') {
            options.language = requestedLanguage;
        }
        // STEP 3: We send the audio file over the internet to Groq's servers for processing.
        // The code waits (awaits) until Groq replies with the transcription text.
        const transcription = await openai.audio.transcriptions.create(options);
        let transcriptText = transcription.text.trim();
        // Filter out common Whisper hallucinations for silent audio
        const lowerText = transcriptText.toLowerCase();
        if (lowerText.includes("thank you for watching") || lowerText === "thank you." || lowerText === "you") {
            transcriptText = "";
        }
        console.log(`Transcription completed successfully.`);
        // Clean up local audio file
        if (fs_1.default.existsSync(audioPath)) {
            fs_1.default.unlinkSync(audioPath); // STEP 4: Delete the temporary audio file so our server doesn't fill up
        }
        if (transcriptText === "") {
            return res.status(400).json({ error: "The recorded audio was completely silent or could not be detected. Please check your microphone and make sure you can hear yourself when you click 'Play' before converting!" });
        }
        // STEP 5: Send the final text back to the React UI as a successful JSON response!
        res.json({ success: true, transcript: transcriptText });
    }
    catch (error) {
        console.error("Error during transcription:", error.message || error);
        // Clean up local audio file on error
        if (fs_1.default.existsSync(audioPath)) {
            fs_1.default.unlinkSync(audioPath);
        }
        res.status(500).json({
            error: "Transcription failed.",
            details: error.message || "An error occurred while calling the Groq API. Please check your API Key."
        });
    }
};
exports.speechToText = speechToText;
