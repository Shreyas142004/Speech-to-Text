import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileAudio, Play, Pause, Copy, Download, Loader2, Check, Mic, Square, Globe, Moon, Sun } from 'lucide-react';

/* 
================================================================================
FRONTEND ARCHITECTURE EXPLANATION:
1. AUDIO COLLECTION: The user records audio via `startRecording` using the browser's MediaRecorder API, or uploads a file via `handleDrop` or `handleFileChange`.
2. SENDING TO BACKEND: When "Convert Audio to Text" is clicked, `handleTranscribe` packages the audio file into a `FormData` object and uses `axios` to send an HTTP POST request to our Express backend at `http://localhost:4000/speech-to-text`.
3. RECEIVING TEXT: The backend returns the transcribed text, which is saved in the `transcript` state and displayed on the UI.
4. TRANSLATION: If the user selects a language and clicks Translate, `handleTranslate` sends the transcript to `http://localhost:4000/translate` and displays the result.
================================================================================
*/

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('auto');
  
  // Translation states
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedCopied, setTranslatedCopied] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File([audioBlob], 'recorded-audio.webm', { type: 'audio/webm' });
        setFile(recordedFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsProcessing(true);
    setTranscript('');

    // STEP 1: We package the audio file and selected language into a format called FormData.
    // This allows us to send large files over the internet to our backend.
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('language', language);

    try {
      // STEP 2: We use Axios to send a secure HTTP POST request to our Node.js backend.
      // The backend receives this file at the '/speech-to-text' endpoint.
      const response = await axios.post('http://localhost:4000/speech-to-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // STEP 3: The backend finishes processing with the Groq API and sends back the final text.
      // We save it in our state to trigger the UI to display the text!
      setTranscript(response.data.transcript);
    } catch (error) {
      console.error('Transcription error:', error);
      const serverMsg = error.response?.data?.error || error.response?.data || error.message;
      setTranscript(`Error: Could not transcribe the audio. \nDetails: ${serverMsg}\n\nPlease check your backend terminal for more information.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!transcript) return;
    setIsTranslating(true);
    setTranslatedText('');
    try {
      // STEP 4: We send the raw English transcript to our backend's '/translate' endpoint.
      // We pass the text and the target language as a simple JSON object.
      const response = await axios.post('http://localhost:4000/translate', {
        text: transcript,
        targetLanguage: targetLanguage
      });
      
      // STEP 5: The backend's Python script finishes translating and returns the new text!
      setTranslatedText(response.data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error: Could not translate the text.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslatedCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setTranslatedCopied(true);
      setTimeout(() => setTranslatedCopied(false), 2000);
    }
  };

  const handleCopy = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen">
      <div className="relative bg-white/80 dark:bg-slate-900/80 shadow-2xl backdrop-blur-xl p-8 md:p-12 border border-white/50 dark:border-slate-700/50 rounded-[2rem] w-full max-w-2xl transition-colors duration-300">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="absolute top-6 right-6 p-2 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 font-bold text-indigo-600 dark:text-indigo-400 text-3xl md:text-4xl transition-colors">
            Speech To Text Converter
          </h1>
        </div>

        {/* Action Buttons (Record) */}
        <div className="flex sm:flex-row flex-col justify-center items-center gap-4 mb-6">
          {isRecording ? (
            <button 
              onClick={stopRecording}
              className="flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 shadow-md px-6 py-2.5 rounded-full font-medium text-white transition-all animate-pulse"
            >
              <Square className="fill-current w-4 h-4" />
              Stop Recording
            </button>
          ) : (
            <button 
              onClick={startRecording}
              className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md px-6 py-2.5 rounded-full font-medium text-white transition-all"
            >
              <Mic className="w-5 h-5" />
              Record Audio
            </button>
          )}
        </div>

        {/* Upload Area */}
        {!file && !isRecording && (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-indigo-50/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-700/50 mx-auto mb-6 p-4 border-2 border-indigo-200 dark:border-slate-600 border-dashed rounded-2xl max-w-sm text-center transition-colors cursor-pointer"
            onClick={() => document.getElementById('audio-upload').click()}
          >
            <Upload className="mx-auto mb-2 w-8 h-8 text-indigo-400 dark:text-indigo-500" />
            <p className="mb-1 font-medium text-gray-600 dark:text-gray-300 text-sm">Click or drag audio file here</p>
            <input 
              type="file" 
              id="audio-upload" 
              className="hidden" 
              accept="audio/*" 
              onChange={handleFileChange} 
            />
          </div>
        )}

        {/* Selected / Recorded File Area */}
        {file && !isRecording && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex md:flex-row flex-col justify-between items-center gap-4 bg-white dark:bg-slate-800 shadow-sm p-4 border border-gray-100 dark:border-slate-700 rounded-2xl w-full transition-colors">
              <div className="flex items-center gap-4 w-full">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-full text-indigo-600 dark:text-indigo-400">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate" title={file.name}>{file.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="font-medium text-red-500 hover:text-red-400 text-sm whitespace-nowrap transition-colors"
                >
                  Remove
                </button>
              </div>
              
              <audio ref={audioRef} src={URL.createObjectURL(file)} controls className="w-full md:w-auto h-10" />
            </div>

            <div className="flex sm:flex-row flex-col justify-center items-center gap-4 w-full">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isProcessing}
                className="bg-white dark:bg-slate-800 shadow-sm px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                <option value="auto">Auto-Detect Language</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>

              <button 
                onClick={handleTranscribe}
                disabled={isProcessing}
                className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 hover:from-blue-600 to-indigo-600 hover:to-indigo-700 disabled:opacity-70 shadow-lg hover:shadow-xl px-8 py-3 rounded-full w-full sm:w-auto font-semibold text-white transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Convert Audio to Text'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Transcript Box */}
        <div className="relative">
          <div className="flex flex-col bg-[rgb(240,242,245)] dark:bg-slate-800/80 p-6 border border-gray-400 dark:border-slate-600 rounded-tl-2xl rounded-br-2xl min-h-[200px] transition-colors">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100 transition-colors">Transcript</h3>
            
            {isProcessing ? (
              <div className="flex flex-col flex-1 justify-center items-center text-gray-500 dark:text-gray-400">
                 <Loader2 className="mb-4 w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin" />
                 <p className="text-sm animate-pulse">Analyzing Audio & Recognizing Speech...</p>
              </div>
            ) : transcript ? (
              <p className="flex-1 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap font-bold tracking-wide leading-loose transition-colors">{transcript}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Your transcript will appear here...</p>
            )}

            {/* Actions for Transcript */}
            {transcript && !isProcessing && (
              <div className="flex justify-between items-center mt-4 pt-4 border-gray-300 dark:border-slate-600 border-t text-xs transition-colors">
                <div className="text-gray-500 dark:text-gray-400">
                   {transcript.length} chars • {transcript.split(/\s+/).filter(w => w.length > 0).length} words
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translator Section */}
        {transcript && !isProcessing && (
          <div className="mt-6 p-6 bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-sm transition-colors">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Translate Text
            </h3>
            
            <div className="flex sm:flex-row flex-col gap-4 mb-4">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isTranslating}
                className="bg-white dark:bg-slate-900 shadow-sm px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-medium text-gray-700 dark:text-gray-200 flex-1 transition-colors"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
                <option value="mr">Marathi</option>
                <option value="bn">Bengali</option>
                <option value="ar">Arabic</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
              </select>
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex justify-center items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 disabled:opacity-70 px-6 py-2 rounded-lg font-semibold transition-all"
              >
                {isTranslating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</>
                ) : 'Translate'}
              </button>
            </div>

            {/* Translated Output */}
            {translatedText && (
              <div className="bg-indigo-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-100 dark:border-slate-700 relative transition-colors">
                <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap font-bold tracking-wide leading-loose mb-6 transition-colors">{translatedText}</p>
                <div className="flex justify-end pt-2 border-indigo-200 dark:border-slate-700 border-t transition-colors">
                  <button 
                    onClick={handleTranslatedCopy}
                    className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs"
                  >
                    {translatedCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {translatedCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
