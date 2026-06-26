import { Request, Response } from "express";
import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import youtubedl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";

// The API keys are loaded from the .env file.
const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
const client = assemblyApiKey ? new AssemblyAI({ apiKey: assemblyApiKey }) : null;
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

// Helper: Extract audio from local video file using FFmpeg
const extractAudioFromVideo = (inputPath: string, outputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioBitrate(64)
      .toFormat('mp3')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

// Helper: Download YouTube audio as MP3
const downloadYoutubeAudio = async (url: string, outputPath: string): Promise<string> => {
  try {
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath
    });
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to download YouTube audio: ${String(error)}`);
  }
};

export const speechToText = async (req: Request, res: Response): Promise<any> => {
  if (!client) return res.status(500).json({ error: "ASSEMBLYAI_API_KEY is missing." });
  if (!groq) return res.status(500).json({ error: "GROQ_API_KEY is missing." });

  const requestedLanguage = req.body.language || 'auto';
  const useMultiSpeaker = req.body.multiSpeaker === 'true';
  const youtubeUrl = req.body.youtubeUrl;

  if (!req.file && !youtubeUrl) {
    return res.status(400).json({ error: "No audio file or YouTube URL provided." });
  }

  let finalAudioPath = "";
  let filesToCleanup: string[] = [];

  try {
    const tempDir = path.join(__dirname, '..', '..', 'uploads');
    
    // ----------------------------------------------------
    // PRE-PROCESSING: Get standard MP3 file
    // ----------------------------------------------------
    if (youtubeUrl) {
      console.log(`[Processor] Downloading YouTube Audio: ${youtubeUrl}`);
      finalAudioPath = path.join(tempDir, `yt-${Date.now()}.mp3`);
      filesToCleanup.push(finalAudioPath);
      await downloadYoutubeAudio(youtubeUrl, finalAudioPath);
    } else if (req.file) {
      filesToCleanup.push(req.file.path);
      
      // If it's a video file, extract the audio
      if (req.file.mimetype.startsWith('video/')) {
        console.log(`[Processor] Extracting audio from video: ${req.file.path}`);
        finalAudioPath = path.join(tempDir, `extracted-${Date.now()}.mp3`);
        filesToCleanup.push(finalAudioPath);
        await extractAudioFromVideo(req.file.path, finalAudioPath);
      } else {
        // Already an audio file
        finalAudioPath = req.file.path;
      }
    }

    let formattedText = "";

    // ----------------------------------------------------
    // SMART ROUTER: Choose API based on User Selection
    // ----------------------------------------------------
    if (useMultiSpeaker) {
        console.log(`[Smart Router] Selected AssemblyAI for English/Auto transcription: ${finalAudioPath}`);
        
        const params: any = {
          audio: finalAudioPath,
          speaker_labels: true, 
        };

        if (requestedLanguage === 'en') {
            params.language_code = "en";
        } else {
            params.language_detection = true;
        }

        const transcript = await client.transcripts.transcribe(params);

        if (transcript.status === 'error') {
            throw new Error(transcript.error);
        }

        if (transcript.utterances && transcript.utterances.length > 0) {
            let currentSpeaker: string | null = null;
            let currentText = "";
            for (const utterance of transcript.utterances) {
                if (currentSpeaker === utterance.speaker) {
                    currentText += " " + utterance.text.trim();
                } else {
                    if (currentSpeaker !== null) {
                        formattedText += `Speaker ${currentSpeaker}: ${currentText.trim()}\n\n`;
                    }
                    currentSpeaker = utterance.speaker;
                    currentText = utterance.text.trim();
                }
            }
            if (currentSpeaker !== null) {
                formattedText += `Speaker ${currentSpeaker}: ${currentText.trim()}\n\n`;
            }
        } else {
            formattedText = transcript.text || "";
        }
        
    } else {
        console.log(`[Smart Router] Selected Groq for Non-English transcription: ${finalAudioPath}`);
        
        // GROQ INTEGRATION (Whisper Large V3)
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(finalAudioPath),
            model: "whisper-large-v3",
            response_format: "text",
            language: requestedLanguage !== 'auto' ? requestedLanguage : undefined,
        });

        // Groq does not have diarization, so we wrap the entire highly accurate text
        formattedText = "Speaker A: " + String(transcription).trim();
    }

    // Clean up files
    filesToCleanup.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    if (formattedText.trim() === "") {
        console.log("Audio was silent.");
    }

    res.json({ success: true, transcript: formattedText.trim() });
    
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || String(error);
    console.error("Error during Smart Router transcription:", errorMessage);
    
    // Clean up files on error
    filesToCleanup.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    if (errorMessage.includes("no spoken audio") || errorMessage.includes("empty audio")) {
        return res.json({ success: true, transcript: "" });
    }

    res.status(500).json({ 
        error: "Transcription failed.", 
        details: errorMessage || "An error occurred during transcription." 
    });
  }
};
