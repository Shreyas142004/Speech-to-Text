# AI Speech-to-Text & Translation Convertor 🎙️

A beautiful, high-performance full-stack web application that instantly converts audio, video, and YouTube links into text. Powered by **React**, **Node.js/Express**, and cutting-edge AI models from **Groq (Whisper Large V3)** and **AssemblyAI**.

## 🚀 Key Features

* **Multi-Source Audio Extraction:** 
  * Record live audio directly from your microphone.
  * Drag & Drop audio/video files (MP4, MP3, WAV, MOV) up to 25MB.
  * **YouTube Integration:** Paste any YouTube video URL, and the server automatically downloads and extracts the audio.
* **Blazing Fast AI Transcription:** Uses the Groq API (Whisper model) as the default engine for near-instant, high-accuracy speech-to-text.
* **Speaker Diarization (Multi-Speaker):** Toggle "Multiple Speakers" to intelligently route the transcription through AssemblyAI, which identifies and color-codes different people speaking (e.g., Speaker 1, Speaker 2).
* **Instant Translation:** Translate your generated transcripts into 8+ regional Indian languages (Hindi, Kannada, Malayalam, Marathi, Bengali, Telugu, Tamil, etc.) using Groq's LLM routing.
* **Transcription History:** A dedicated dashboard page that automatically saves your past transcriptions to local storage, allowing you to reload or delete them anytime.
* **Premium UI/UX:** Built with React, Tailwind CSS, and Lucide icons. Includes a gorgeous glass-morphic navigation bar, seamless React Router multi-page navigation, and a Dark/Light mode toggle.

## 🛠️ Technology Stack

* **Frontend:** React (Vite), React Router v7, Tailwind CSS, Axios, React Hot Toast.
* **Backend:** Node.js, Express, TypeScript, Multer (for file uploads).
* **Media Processing:** `fluent-ffmpeg` and `youtube-dl-exec` for server-side video-to-audio extraction.
* **AI Providers:** 
  * [Groq Cloud](https://groq.com/) (Llama-3 & Whisper)
  * [AssemblyAI](https://www.assemblyai.com/) (Speaker Diarization)

## ⚙️ Local Setup & Installation

### Prerequisites
1. Node.js installed on your machine.
2. [FFmpeg](https://ffmpeg.org/download.html) installed and added to your system PATH (required for video file and YouTube extraction).
3. API Keys for Groq and AssemblyAI.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shreyas142004/Speech-to-Text.git
   cd Speech-to-Text
   ```

2. **Install Dependencies:**
   Since this is a monorepo setup, you can install everything from the root folder:
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your secret API keys:
   ```env
   PORT=4000
   GROQ_API_KEY=your_groq_api_key_here
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   ```

4. **Start the Application:**
   Run the development servers concurrently (Frontend & Backend):
   ```bash
   npm run dev
   ```
   
5. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`.

---
*Created by [Shreyas142004](https://github.com/Shreyas142004)*
