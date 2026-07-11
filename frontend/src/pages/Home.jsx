import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Upload,
  FileAudio,
  Play,
  Square,
  Copy,
  Download,
  Loader2,
  Check,
  Mic,
  Globe,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function Home() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [multiSpeaker, setMultiSpeaker] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const hasLoadedHistoryRef = useRef(false);
  const outputRef = useRef(null);

  useEffect(() => {
    if (location.state?.transcript && !hasLoadedHistoryRef.current) {
      hasLoadedHistoryRef.current = true;
      setTranscript(location.state.transcript);
      toast.success(`Loaded from history: ${location.state.fileName}`);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type.startsWith("audio/") ||
        droppedFile.type.startsWith("video/"))
    ) {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error("Invalid file type! Please upload an audio or video file.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type.startsWith("audio/") ||
        selectedFile.type.startsWith("video/"))
    ) {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error("Invalid file type! Please upload an audio or video file.");
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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const recordedFile = new File([audioBlob], "recorded-audio.webm", {
          type: "audio/webm",
        });
        setFile(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(
        "Could not access microphone. Please ensure permissions are granted.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!file && !youtubeUrl) return;

    setIsProcessing(true);
    setTranscript("");

    const formData = new FormData();
    if (file) {
      formData.append("audio", file);
    }
    formData.append("language", language);
    formData.append("multiSpeaker", multiSpeaker);
    if (youtubeUrl) {
      formData.append("youtubeUrl", youtubeUrl);
    }

    try {
      // const response = await axios.post(
      //   "http://localhost:4000/speech-to-text",
      //   formData,
      //   {
      //     headers: { "Content-Type": "multipart/form-data" },
      //   },
      // );

      const API_URL = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${API_URL}/speech-to-text`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const returnedTranscript = response.data.transcript;

      if (!returnedTranscript || returnedTranscript.trim() === "") {
        toast.error(
          "The recorded audio was completely silent. Please check your microphone.",
        );
        setTranscript("");
      } else {
        toast.success("Transcription complete!");
        setTranscript(returnedTranscript);
        
        // Scroll to top instead of specifically to output, since output is now the only thing on screen
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const newEntry = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          text: returnedTranscript,
          fileName: youtubeUrl
            ? "YouTube Video"
            : file?.name || "Recorded Audio",
        };
        const currentHistory = JSON.parse(
          localStorage.getItem("transcriptionHistory") || "[]",
        );
        const newHistory = [newEntry, ...currentHistory].slice(0, 4);
        localStorage.setItem(
          "transcriptionHistory",
          JSON.stringify(newHistory),
        );
      }
    } catch (error) {
      console.error("Transcription error:", error);
      const serverMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message;
      toast.error(serverMsg || "Transcription failed");
      setTranscript(
        `Error: Could not transcribe the audio. \nDetails: ${serverMsg}`,
      );
    } finally {
      setIsProcessing(false);
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
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateToTranslate = () => {
    navigate("/translate", { state: { textToTranslate: transcript } });
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const paragraphs = text.split("\n\n");
    return paragraphs.map((p, idx) => {
      const speakerMatch = p.match(/^Speaker ([A-Z]):\s*(.*)/is);
      if (speakerMatch) {
        const speakerLetter = speakerMatch[1].toUpperCase();
        const content = speakerMatch[2];
        const speakerNumber = speakerLetter.charCodeAt(0) - 64;

        const colors = [
          "bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
          "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
          "bg-purple-100/50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
          "bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
          "bg-pink-100/50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800",
        ];

        const colorIndex =
          isNaN(speakerNumber) || speakerNumber < 1
            ? 0
            : (speakerNumber - 1) % colors.length;
        const colorClass = colors[colorIndex];

        return (
          <div
            key={idx}
            className="mb-5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm p-4 rounded-2xl border border-white/50 dark:border-slate-800/50 shadow-sm"
          >
            <span
              className={`inline-block px-3 py-1 rounded-lg text-xs font-bold tracking-wider mb-2 uppercase shadow-sm ${colorClass}`}
            >
              Speaker {speakerNumber}
            </span>
            <p className="text-base font-medium tracking-wide leading-loose">
              {content}
            </p>
          </div>
        );
      }
      return (
        <p
          key={idx}
          className="mb-4 text-base font-medium tracking-wide leading-loose whitespace-pre-wrap px-2"
        >
          {p}
        </p>
      );
    });
  };

  const resetTranscription = () => {
    setTranscript("");
    setFile(null);
    setYoutubeUrl("");
    // Optional: Keep language and multiSpeaker settings
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      
      {!transcript && (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl">Input Source</h2>
          </div>

          <div className="flex flex-col gap-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse"
              >
                <Square className="fill-current w-5 h-5" />
                Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800/50"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider font-bold">
                Or
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800/50"></div>
            </div>

            {!file && !isRecording && (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Paste YouTube URL here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="input-glass w-full"
                />

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="input-glass border-dashed border-2 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 group"
                  onClick={() =>
                    document.getElementById("audio-upload").click()
                  }
                >
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors mb-3">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                    Drag & Drop or Click to Upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    MP3, WAV, MP4, MOV up to 25MB
                  </p>
                  <input
                    type="file"
                    id="audio-upload"
                    className="hidden"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            )}

            {file && !isRecording && (
              <div className="input-glass flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <FileAudio className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-colors border border-slate-200 dark:border-slate-800"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl">AI Settings</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Original Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isProcessing}
                className="input-glass w-full appearance-none"
              >
                <option value="auto">✨ Auto-Detect Language</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>
            </div>

            <label className="flex items-start gap-3 input-glass cursor-pointer hover:border-blue-300 dark:hover:border-blue-700/50 group">
              <div className="pt-1">
                <input
                  type="checkbox"
                  id="multiSpeaker"
                  checked={multiSpeaker}
                  onChange={(e) => setMultiSpeaker(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Speaker Diarization
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Separate text by who is speaking (AssemblyAI)
                </p>
              </div>
            </label>

            <button
              onClick={handleTranscribe}
              disabled={isProcessing || (!file && !youtubeUrl)}
              className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isProcessing ? "Transcribing via AI..." : "Transcribe Audio"}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Result View */}
      {transcript && (
        <div className="flex flex-col gap-6" ref={outputRef}>
          <div className="glass-panel p-6 md:p-8 flex flex-col h-full min-h-[500px] border-t-4 border-t-blue-500 shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Transcription Complete
              </h2>
              <button 
                onClick={resetTranscription}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto"
              >
                Start New
              </button>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 w-full bg-transparent overflow-y-auto max-h-[60vh] custom-scrollbar pr-2 mb-6">
              <div id="transcript-content" className="text-slate-800 dark:text-slate-200">
                {renderFormattedText(transcript)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <button 
                onClick={navigateToTranslate} 
                className="flex-1 flex justify-center items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-1 active:scale-95 group"
                title="Translate this text"
              >
                <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Translate Text
              </button>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={handleCopy} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />} {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownload} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                  <Download className="w-5 h-5" /> Save
                </button>
              </div>
            </div>

            {/* Footer metadata */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-2 justify-between items-center text-xs font-bold text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                Powered by Groq & AssemblyAI
              </span>
              <span>
                {transcript.length} chars •{" "}
                {transcript.split(/\s+/).filter((w) => w.length > 0).length}{" "}
                words
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
