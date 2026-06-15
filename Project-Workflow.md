# Speech-to-Text and Translation Project Workflow

This document provides a comprehensive technical overview of the Speech-to-Text project, detailing its architecture, data flow, and the specific packages used to achieve its functionality. This is intended to help explain the internal workings of the project during presentations or lectures.

---

## 1. Project Architecture Overview
The project is built on a modern **Client-Server Architecture**. 
- **The Frontend (Client):** Built with **React.js** (via Vite) and styled with **Tailwind CSS**. It is responsible for the user interface, recording audio, and displaying results.
- **The Backend (Server):** Built with **Node.js** and **Express.js** (using TypeScript). It acts as the bridge between the frontend and the AI models, handling file uploads and triggering the underlying Python scripts.
- **The AI Engine:** Utilizes the lightning-fast **Groq API** (running the Whisper `large-v3` model) for speech recognition, and a local Python script leveraging Google Translate's engine for text translation.

---

## 2. Audio Reception and Upload Workflow
**Where does it receive the audio?**
1. **User Interaction:** The user interacts with the React frontend. They can either:
   - Click "Record Audio," which uses the browser's native **MediaRecorder API** to capture live microphone input.
   - Drag and drop an existing audio file from their computer into the upload area.
2. **Data Packaging:** The frontend bundles this audio file into a `FormData` object.
3. **Transmission:** The frontend uses **Axios** to send a secure HTTP POST request containing the audio file to the backend (`http://localhost:4000/speech-to-text`).
4. **Backend Reception:** The Node.js server receives the request. A middleware package named **Multer** intercepts the incoming data stream and safely saves the audio file to a temporary `uploads/` folder on the local hard drive.

---

## 3. Speech-to-Text Conversion Workflow
**How does it convert audio to text?**
1. **API Integration:** Once the audio file is safely saved in the `uploads/` folder, the Node.js backend prepares it to be sent to Groq's high-speed cloud servers.
2. **Groq API Execution:** The backend uses the `openai` npm package, configured to securely point to the Groq API (`https://api.groq.com/openai/v1`). It transmits the audio file along with the user's selected language.
3. **AI Processing:** 
   - Groq's massive cloud infrastructure processes the audio using the **Whisper `large-v3` model** at lightning speed.
   - It transcribes the spoken words into written text and applies advanced filters to ignore any silent background noise.
4. **Data Retrieval & Cleanup:** The text is instantly returned to the Node.js server. The server immediately **deletes** the temporary audio file from the local hard drive to free up storage space, and sends the final text back to the React frontend as a JSON response.

---

## 4. Text Translation Workflow
**How does the text translation work?**
1. **User Request:** After transcription, the frontend displays the text. The user selects a target language from a dropdown and clicks "Translate."
2. **Transmission:** The frontend sends the transcribed text and the chosen language code to a separate backend endpoint (`POST /translate`).
3. **Python Translation Script:** The Node.js server spawns a custom Python script (`translate.py`) and feeds the text directly into the script's standard input to prevent encoding errors.
4. **Deep Translator Execution:** The Python script utilizes the **`deep-translator`** package, which connects to Google Translate's public engine. It processes the text and instantly translates it into the target language.
5. **Final Display:** The translated text is returned to the Node.js server, which passes it back to the React frontend, where it is displayed in bold, clearly spaced text.

## 5. User Interface & Dynamic Theming Workflow
**How does the application manage its appearance?**
1. **Dynamic Tailwind Styling:** The React application utilizes Tailwind CSS for its design. Every UI component is equipped with dual styles: one for Light Mode and one for Dark Mode (using the `dark:` prefix).
2. **Theme Toggling:** The user can toggle a Sun/Moon icon in the top right corner.
3. **State & Local Storage:** When toggled, the React app updates the `isDarkMode` state and injects a `dark` class into the root `<html>` element of the browser. It also saves this preference to the browser's `localStorage`.
4. **Smooth Transitions:** Because of Tailwind's utility classes (`transition-colors duration-300`), every background, text, and border gracefully fades between the bright aesthetic and the deep slate nighttime aesthetic.

---

## 6. Technology Stack and Packages Used

### Frontend Packages (React / Vite)
- **React (`react`, `react-dom`):** The core framework used to build the user interface components.
- **Vite (`vite`):** A fast build tool and development server that powers the React application.
- **Tailwind CSS (`tailwindcss`):** A utility-first CSS framework used for all the styling, layout, gradients, and typography.
- **Axios (`axios`):** A promise-based HTTP client used to send the audio files and translation requests to the backend server.
- **Lucide React (`lucide-react`):** Used for the clean, modern vector icons (microphone, copy, download, etc.) throughout the UI.

### Backend Packages (Node.js / Express)
- **Express (`express`):** The core web framework used to create the server and API endpoints (`/speech-to-text` and `/translate`).
- **TypeScript (`typescript`):** Provides static typing to make the backend code safer and more robust.
- **Multer (`multer`):** A middleware handling `multipart/form-data`, primarily used for securely uploading and saving the incoming audio files to the hard drive.
- **Cors (`cors`):** Middleware that allows the frontend (running on a different port) to securely communicate with the backend.

### AI and Cloud Packages
- **OpenAI (`openai`):** The official SDK used to securely interface with the Groq API. It streams the audio file to Groq's cloud infrastructure for high-speed transcription.
- **Deep Translator (`deep-translator`):** A flexible Python library that provides access to various translation engines (used here with Google Translate) to translate the transcribed text into different languages locally.
