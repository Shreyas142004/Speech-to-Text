# Project Architecture Flowchart

Here is the complete step-by-step visual architecture of how your application processes audio, generates text, and translates it. 

```mermaid
sequenceDiagram
    autonumber
    
    actor User
    participant React UI as Frontend (React / Tailwind)
    participant Express as Backend (Node.js / Express)
    participant Multer as File System (Multer)
    participant Groq as Groq AI (Whisper Model)
    participant Python as Python Script (deep-translator)
    participant Google as Google Translate Engine

    %% Transcription Flow
    Note over User, Groq: PHASE 1: Speech to Text (Transcription)
    User->>React UI: Clicks "Record" & Speaks OR Uploads Audio
    React UI->>Express: POST /speech-to-text (Sends Audio File via FormData)
    Express->>Multer: Intercepts file and saves to /uploads folder
    Multer-->>Express: Returns local file path
    Express->>Groq: Sends saved audio file via API request
    Groq-->>Express: Returns transcribed English text
    Express->>Multer: Deletes the temporary audio file
    Express-->>React UI: Returns success + English Transcript
    React UI-->>User: Displays Transcript on Screen

    %% Translation Flow
    Note over User, Google: PHASE 2: Translation
    User->>React UI: Selects language & Clicks "Translate"
    React UI->>Express: POST /translate (Sends English Text & Target Language)
    Express->>Python: Spawns 'translate.py' (Pipes text to stdin)
    Python->>Google: Requests translation via deep-translator package
    Google-->>Python: Returns Translated Text
    Python-->>Express: Prints Translated Text to stdout
    Express-->>React UI: Returns success + Translated Text
    React UI-->>User: Displays Translated Text on Screen
```

## Key Components:
- **Frontend (React)**: Handles the microphone, file dropping, and UI layout.
- **Backend (Express)**: Acts as the secure middleman. It hides your API keys and orchestrates the heavy lifting.
- **Multer**: Safely stores incoming files to your hard drive so the Groq API can read them.
- **Groq AI**: The incredibly fast engine running the "Whisper" model to turn speech into text.
- **Python**: A local child process spawned by Node.js, specifically used because Python has better free translation libraries than Node.js.
