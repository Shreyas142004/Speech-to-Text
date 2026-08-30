# AI Speech-to-Text & Translation Converter 🎙️✨

A modern, high-performance full-stack web application that instantly transcribes live voice recordings, uploaded audio/video files, and YouTube video URLs into text, with multi-speaker identification and multi-language translation.

![License](https://img.shields.io/badge/License-ISC-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Render-informational?logo=render)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)

---

## 🌟 Features

* 🎙️ **Live Microphone Recording:** Record audio directly from your browser with instant transcription.
* 📁 **Multi-Format File Support:** Drag & drop MP3, WAV, MP4, MOV files up to 25MB. Automatic audio extraction for video files.
* 📹 **YouTube Video URL Converter:** Input any YouTube URL (standard videos, shorts, or share links) to extract and transcribe audio seamlessly via RapidAPI integration.
* 👥 **Speaker Diarization (Multi-Speaker):** Intelligently separates and color-codes transcriptions by speaker (e.g., *Speaker 1*, *Speaker 2*) powered by **AssemblyAI**.
* ⚡ **Ultra-Fast AI Transcription:** Utilizes **Groq Cloud (Whisper Large V3)** for near-instant, high-accuracy speech-to-text.
* 🌐 **Multi-Language Translation:** Translate your generated transcripts into foreign & regional languages (Hindi, Kannada, Spanish, etc.) powered by **Groq Llama 3**.
* 📜 **Transcription History:** Local storage dashboard tracking your recent transcriptions with 1-click reloading and management.
* 🎨 **Modern Glassmorphism UI:** Built with React, Tailwind CSS, Lucide icons, Dark/Light mode toggle, and responsive glass-morphism panels.

---

## 🏗️ Architecture & Deployment

The application is deployed across a decoupled cloud architecture:

```
[ React Frontend ]  ---> (Vercel)
        |
        v  (HTTPS / Axios)
[ Express TypeScript Backend ] ---> (Render)
        |
        +---> RapidAPI (YouTube MP3 Extraction & Cloud IP Bypass)
        +---> AssemblyAI (Speaker Diarization Engine)
        +---> Groq Cloud (Whisper V3 & Llama 3 Translation)
```

* **Frontend Hosting:** [Vercel](https://vercel.com)
* **Backend Hosting:** [Render](https://render.com) (Node.js Web Service)
* **YouTube Extraction:** [RapidAPI YouTube MP4/MP3 Downloader](https://rapidapi.com) (Bypasses server IP bans & cloud timeouts)

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite 8, React Router v7, Tailwind CSS 3, Axios, React Hot Toast, Lucide Icons.
* **Backend:** Node.js, Express 5, TypeScript 6, Multer, Fluent-FFmpeg.
* **AI Providers & APIs:**
  * [Groq Cloud API](https://groq.com/) — *Whisper Large V3 & Llama 3*
  * [AssemblyAI API](https://www.assemblyai.com/) — *Speaker Diarization*
  * [RapidAPI](https://rapidapi.com/) — *Cloud YouTube Audio Extraction*

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
PORT=4000
GROQ_API_KEY=your_groq_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
RAPIDAPI_KEY=your_rapidapi_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shreyas142004/Speech-to-Text.git
   cd Speech-to-Text
   ```

2. **Install Root & Frontend Dependencies:**
   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Set Up Environment Variables:**
   Create `.env` in the root folder and `frontend/.env` in the frontend folder as shown above.

4. **Run Development Mode:**
   ```bash
   npm run dev
   ```
   * Frontend will start at: `http://localhost:5173`
   * Backend will start at: `http://localhost:4000`

---

## 👤 Author

* **Shreyas R A** — [GitHub](https://github.com/Shreyas142004)
