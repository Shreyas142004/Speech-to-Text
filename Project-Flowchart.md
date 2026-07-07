# Project Architecture Flowchart

Here is the complete visual architecture of how your application processes audio, videos, YouTube URLs, generates text via AI, and translates it. 

```mermaid
sequenceDiagram
    autonumber
    
    actor User
    participant Frontend as React Frontend (Home Page)
    participant Backend as Node.js / Express Backend
    participant Processor as Media Processors (FFmpeg / yt-dlp)
    participant AI as AI Engine (Groq / AssemblyAI)
    participant Python as Python Translator (deep-translator)

    %% PHASE 1: Input & Media Processing
    Note over User, Processor: PHASE 1: Media Input & Processing
    User->>Frontend: Provides Audio/Video File OR YouTube URL
    Frontend->>Backend: POST /speech-to-text (FormData)
    
    alt is YouTube URL
        Backend->>Processor: youtube-dl-exec: Downloads audio stream
        Processor-->>Backend: Returns local .mp3 file
    else is Video File
        Backend->>Processor: fluent-ffmpeg: Extracts audio track from video
        Processor-->>Backend: Returns local .mp3 file
    else is Audio File
        Backend-->>Backend: Multer saves the file directly
    end

    %% PHASE 2: AI Transcription
    Note over Backend, AI: PHASE 2: Smart AI Transcription
    
    alt Single Speaker (Default)
        Backend->>AI: Sends audio to Groq API (Whisper Large V3)
        AI-->>Backend: Returns blazing-fast transcription
    else Multiple Speakers Enabled
        Backend->>AI: Sends audio to AssemblyAI API
        AI-->>Backend: Returns speaker-diarized text (Speaker 1, Speaker 2)
    end
    
    Backend->>Backend: Deletes temporary audio/video files
    Backend-->>Frontend: Returns final formatted English Transcript
    Frontend-->>User: Displays Transcript & Saves to LocalStorage History

    %% PHASE 3: Translation
    Note over User, Python: PHASE 3: Multi-Language Translation
    User->>Frontend: Selects Regional Language & Clicks "Translate"
    Frontend->>Backend: POST /translate (Sends English Text & Target Language)
    Backend->>Python: Spawns 'translate.py' (Pipes text to stdin)
    Python-->>Backend: Returns Translated Text (via Google Translate)
    Backend-->>Frontend: Returns success + Translated Text
    Frontend-->>User: Displays Translated Text on Screen
```

## Key Components Explained:
- **Frontend (React Router)**: A multi-page application holding the Home page (for processing) and a History dashboard (powered by browser LocalStorage).
- **Backend (Express)**: Acts as the secure orchestrator. It manages API keys, temporary files, and routes audio to the correct AI model.
- **Media Processors**: 
  - `fluent-ffmpeg`: Strips audio tracks out of heavy video files (MP4/MOV) locally so the APIs don't reject them.
  - `youtube-dl-exec`: Intercepts YouTube links and securely rips the audio stream.
- **Groq AI (Whisper)**: The ultra-fast default engine for standard transcription and auto-language detection.
- **AssemblyAI**: Used specifically when the "Multiple Speakers" toggle is active to identify distinct human voices.
- **Python**: A local child process spawned by Node.js, specifically used because Python has access to robust free translation packages (`deep-translator`).
