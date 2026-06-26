import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload, FileAudio, Play, Square, Copy, Download, Loader2, Check, Mic, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function Home() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [multiSpeaker, setMultiSpeaker] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // Translation states
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedCopied, setTranslatedCopied] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.transcript) {
      setTranscript(location.state.transcript);
      toast.success(`Loaded from history: ${location.state.fileName}`);
      // Clear the state so refreshing doesn't show the toast again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/'))) {
      setFile(droppedFile);
    } else if (droppedFile) {
      toast.error('Invalid file type! Please upload an audio or video file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('video/'))) {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Invalid file type! Please upload an audio or video file.');
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
    if (!file && !youtubeUrl) return;

    setIsProcessing(true);
    setTranscript('');
    setTranslatedText('');

    const formData = new FormData();
    if (file) {
      formData.append('audio', file);
    }
    formData.append('language', language);
    formData.append('multiSpeaker', multiSpeaker);
    if (youtubeUrl) {
      formData.append('youtubeUrl', youtubeUrl);
    }

    try {
      const response = await axios.post('http://localhost:4000/speech-to-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const returnedTranscript = response.data.transcript;
      
      if (!returnedTranscript || returnedTranscript.trim() === "") {
        toast.error("The recorded audio was completely silent. Please check your microphone.");
        setTranscript("");
      } else {
        toast.success("Transcription complete!");
        setTranscript(returnedTranscript);
        
        // Save to history via localStorage directly
        const newEntry = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          text: returnedTranscript,
          fileName: youtubeUrl ? "YouTube Video" : (file?.name || "Recorded Audio")
        };
        const currentHistory = JSON.parse(localStorage.getItem('transcriptionHistory') || '[]');
        localStorage.setItem('transcriptionHistory', JSON.stringify([newEntry, ...currentHistory]));
      }
    } catch (error) {
      console.error('Transcription error:', error);
      const serverMsg = error.response?.data?.error || error.response?.data?.details || error.message;
      toast.error(`Error: ${serverMsg}`);
      setTranscript(`Error: Could not transcribe the audio. \nDetails: ${serverMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!transcript) return;
    setIsTranslating(true);
    setTranslatedText('');
    try {
      const response = await axios.post('http://localhost:4000/translate', {
        text: transcript,
        targetLanguage: targetLanguage
      });
      
      if (response.data.translatedText) {
        toast.success("Translation complete!");
        setTranslatedText(response.data.translatedText);
      } else {
        toast.error("Translation returned empty.");
      }
    } catch (error) {
      console.error('Translation error:', error);
      const serverMsg = error.response?.data?.error || error.response?.data?.details || error.message;
      toast.error(`Translation Failed: ${serverMsg}`);
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

  const renderFormattedText = (text) => {
    if (!text) return null;
    const paragraphs = text.split('\n\n');
    return paragraphs.map((p, idx) => {
      const speakerMatch = p.match(/^Speaker ([A-Z]):\s*(.*)/is);
      if (speakerMatch) {
        const speakerLetter = speakerMatch[1].toUpperCase();
        const content = speakerMatch[2];
        const speakerNumber = speakerLetter.charCodeAt(0) - 64; 
        
        const colors = [
          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
          'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
        ];
        
        const colorIndex = (isNaN(speakerNumber) || speakerNumber < 1) ? 0 : (speakerNumber - 1) % colors.length;
        const colorClass = colors[colorIndex];

        return (
          <div key={idx} className="mb-5">
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold tracking-wider mb-2 uppercase ${colorClass}`}>
              Speaker {speakerNumber}
            </span>
            <p className="text-base font-bold tracking-wide leading-loose">
              {content}
            </p>
          </div>
        );
      }
      return <p key={idx} className="mb-4 text-base font-bold tracking-wide leading-loose whitespace-pre-wrap">{p}</p>;
    });
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Controls */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="dashboard-card p-6">
          <h2 className="font-semibold text-lg mb-4">Input Source</h2>
          
          <div className="flex flex-col gap-4">
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="w-full flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 py-3 rounded-xl font-medium transition-all"
              >
                <Square className="fill-current w-4 h-4" />
                Stop Recording
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium shadow-sm transition-all"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </button>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {!file && !isRecording && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Paste YouTube URL here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="input-minimal w-full"
                />
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Or Upload</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="input-minimal border-dashed border-2 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  onClick={() => document.getElementById('audio-upload').click()}
                >
                  <Upload className="w-6 h-6 text-slate-400 mb-3" />
                  <p className="font-medium text-sm text-slate-600 dark:text-slate-300">Upload audio or video file</p>
                  <p className="text-xs text-slate-400 mt-1">MP3, WAV, MP4, MOV up to 25MB</p>
                  <input type="file" id="audio-upload" className="hidden" accept="audio/*,video/*" onChange={handleFileChange} />
                </div>
              </div>
            )}

            {file && !isRecording && (
              <div className="input-minimal flex items-center justify-between p-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileAudio className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Square className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card p-6">
          <h2 className="font-semibold text-lg mb-4">Transcription Settings</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isProcessing}
                className="input-minimal w-full"
              >
                <option value="auto">Auto-Detect</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#09090b] p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                id="multiSpeaker"
                checked={multiSpeaker}
                onChange={(e) => setMultiSpeaker(e.target.checked)}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="multiSpeaker" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                Enable Multiple Speakers
                <p className="text-xs text-slate-500 font-normal mt-0.5">Uses AssemblyAI (English only)</p>
              </label>
            </div>
            
            <button 
              onClick={handleTranscribe}
              disabled={isProcessing || (!file && !youtubeUrl)}
              className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-medium shadow-sm transition-all mt-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isProcessing ? 'Processing...' : 'Transcribe'}
            </button>
          </div>
        </div>

        {/* Translation Settings */}
        {transcript && !isProcessing && (
          <div className="dashboard-card p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-400" /> Translate
            </h2>
            <div className="flex flex-col gap-4">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isTranslating}
                className="input-minimal w-full"
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
                className="w-full flex justify-center items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 py-3 rounded-xl font-medium transition-all"
              >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Translate'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Outputs */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="dashboard-card p-6 flex flex-col h-full min-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Transcript</h2>
            {transcript && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-[#09090b] rounded-lg border border-slate-200 dark:border-slate-800">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-[#09090b] rounded-lg border border-slate-200 dark:border-slate-800">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 input-minimal border-transparent bg-slate-50 dark:bg-[#09090b] p-4 overflow-y-auto max-h-[700px]">
            {isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-3" />
                <p className="text-sm font-medium">Processing audio...</p>
              </div>
            ) : transcript ? (
              <div id="transcript-content" className="text-slate-800 dark:text-slate-200 p-2">
                {renderFormattedText(transcript)}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Upload and transcribe audio to see results.
              </div>
            )}
          </div>
          
          {transcript && (
            <div className="mt-4 text-xs text-slate-400 font-medium text-right">
              {transcript.length} characters • {transcript.split(/\s+/).filter(w => w.length > 0).length} words
            </div>
          )}
        </div>

        {translatedText && (
          <div className="dashboard-card p-6 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-100">Translation</h2>
              <button onClick={handleTranslatedCopy} className="p-2 text-blue-500 hover:text-blue-700 transition-colors bg-white dark:bg-[#18181b] rounded-lg border border-blue-100 dark:border-blue-800">
                {translatedCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-blue-900 dark:text-blue-100">
              {renderFormattedText(translatedText)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
