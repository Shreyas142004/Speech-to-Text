import { Request, Response } from "express";
import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
// @ts-ignore
import ffmpegStatic from "ffmpeg-static";
// @ts-ignore
import ffprobeStatic from "ffprobe-static";

// Set the ffmpeg paths so it works reliably on Render
if (ffmpegStatic && ffprobeStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ffmpeg.setFfprobePath(ffprobeStatic.path);
  
  // yt-dlp strictly requires both ffmpeg and ffprobe to be in the system PATH.
  // We temporarily prepend their directories to process.env.PATH so it finds them.
  const ffmpegDir = path.dirname(ffmpegStatic);
  const ffprobeDir = path.dirname(ffprobeStatic.path);
  process.env.PATH = `${ffmpegDir}${path.delimiter}${ffprobeDir}${path.delimiter}${process.env.PATH}`;
}

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

// Helper: Extract YouTube Video ID from various URL formats
const extractYoutubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

// Helper: Download YouTube audio via RapidAPI (Bypasses all server IP blocks!)
const downloadYoutubeAudio = async (youtubeUrl: string, outputPath: string): Promise<string> => {
  const videoId = extractYoutubeId(youtubeUrl);
  const rapidApiKey = process.env.RAPIDAPI_KEY || 'ec06d349cemshb189e71374a711ap114098jsnaf41a5477e92';
  const rapidApiHost = 'youtube-mp4-mp3-downloader.p.rapidapi.com';

  console.log(`[RapidAPI] Requesting conversion for YouTube ID: ${videoId}`);

  // Step 1: Initiate download/conversion
  const initRes = await axios.get('https://youtube-mp4-mp3-downloader.p.rapidapi.com/api/v1/download', {
    params: { format: '360', id: videoId },
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': rapidApiHost
    }
  });

  if (!initRes.data || !initRes.data.progressId) {
    throw new Error('RapidAPI failed to initiate YouTube conversion.');
  }

  const progressId = initRes.data.progressId;
  console.log(`[RapidAPI] Processing conversion (Progress ID: ${progressId})...`);

  // Step 2: Poll progress endpoint until completed (max 30 seconds)
  let downloadUrl = '';
  for (let i = 0; i < 15; i++) {
    await new Promise(res => setTimeout(res, 2000));
    
    const progressRes = await axios.get('https://youtube-mp4-mp3-downloader.p.rapidapi.com/api/v1/progress', {
      params: { id: progressId },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    });

    if (progressRes.data && progressRes.data.finished && progressRes.data.downloadUrl) {
      downloadUrl = progressRes.data.downloadUrl;
      break;
    }
  }

  if (!downloadUrl) {
    throw new Error('RapidAPI conversion timed out or failed to return audio link.');
  }

  console.log(`[RapidAPI] Downloading converted audio file from stream link...`);

  // Step 3: Stream the converted audio file into our local temp path for AssemblyAI / Groq
  const fileWriter = fs.createWriteStream(outputPath);
  const audioStream = await axios.get(downloadUrl, { responseType: 'stream' });

  return new Promise((resolve, reject) => {
    audioStream.data.pipe(fileWriter);
    fileWriter.on('finish', () => resolve(outputPath));
    fileWriter.on('error', (err) => reject(new Error(`Failed to save stream: ${err.message}`)));
  });
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
