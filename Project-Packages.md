# Complete Package Manifest
## Speech-to-Text & Translation Project

This document provides an exhaustive list of every package and library installed and used within the project, categorized by their specific role.

---

### 1. Frontend Dependencies (React UI)
These packages are responsible for building, styling, and rendering the user interface in the browser.

* **react (`^19.2.6`)** & **react-dom (`^19.2.6`)**: The core libraries for the React framework used to build the interactive web interface.
* **tailwindcss (`^3.4.19`)**: A highly-customizable, utility-first CSS framework used for all styling (buttons, colors, layout, spacing).
* **autoprefixer (`^10.5.0`)** & **postcss (`^8.5.15`)**: Tools used alongside Tailwind CSS to ensure the styles work perfectly across all modern web browsers.
* **lucide-react (`^1.16.0`)**: A beautiful, modern vector icon library. It provides the icons seen in the app (Microphone, Globe, Copy, Loader, etc.).
* **axios (`^1.16.1`)**: A robust HTTP client used by the React app to send audio files and text data securely to the backend server.

---

### 2. Backend Dependencies (Node.js Server)
These packages run on the server to handle routing, file processing, and API communication.

* **express (`^5.2.1`)**: The fast, unopinionated web framework for Node.js. It creates the server and handles the `/speech-to-text` and `/translate` endpoints.
* **cors (`^2.8.6`)**: Middleware that allows the frontend application (running on a different port during development) to securely communicate with the backend.
* **multer (`^2.1.1`)**: Specialized middleware for handling `multipart/form-data`. It is strictly used to receive the uploaded `.webm` audio files and securely save them to the disk.
* **dotenv (`^17.4.2`)**: A zero-dependency module that securely loads private environment variables (like the `GROQ_API_KEY`) from the `.env` file into the server.
* **openai (`^6.42.0`)**: The official OpenAI SDK. It is used by the backend to securely transmit audio files to the Groq Cloud API for lightning-fast transcription using the `whisper-large-v3` model.

---

### 3. Python Dependencies (Translation Engine)
Since Node.js lacks reliable native translation libraries, the project relies on a local Python script for text translation.

* **deep-translator**: A highly flexible Python package that acts as a wrapper around the free Google Translate engine. It takes the text provided by Node.js, translates it, and returns it.

---

### 4. Development Dependencies (Tooling)
These packages are only used by the developer to build, compile, and run the project locally. They do not ship to production.

* **typescript (`^6.0.3`)**: A superset of JavaScript that adds static typing, catching errors early during development.
* **vite (`^8.0.12`)** & **@vitejs/plugin-react (`^6.0.1`)**: The incredibly fast build tool and development server powering the React frontend.
* **concurrently (`^9.0.0`)**: A utility that allows the developer to boot up both the frontend (Vite) and backend (Node) servers simultaneously with a single command (`npm run dev`).
* **ts-node-dev (`^2.0.0`)** & **ts-node (`^10.9.2`)**: Execution environments that allow Node.js to run TypeScript files directly during development without needing to manually compile them first.
* **eslint (`^10.3.0`)**: A static code analysis tool used to identify problematic patterns in the JavaScript/TypeScript code.
* **Types `@types/...`**: Various type definition packages (`@types/express`, `@types/node`, `@types/react`, etc.) that provide TypeScript support for packages that were originally written in plain JavaScript.
