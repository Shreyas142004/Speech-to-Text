import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Globe,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useLocation } from "react-router-dom";

function Translate() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.textToTranslate) {
      setText(location.state.textToTranslate);
      // Clear state so refresh doesn't trigger it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to translate!");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");

    try {
      // const response = await axios.post('http://localhost:4000/translate', {
      //   text: text,
      //   targetLanguage: targetLanguage
      // });

      const API_URL = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${API_URL}/speech-to-text`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.translatedText) {
        toast.success("Translation complete!");
        setTranslatedText(response.data.translatedText);
      } else {
        toast.error("Translation returned empty.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      const serverMsg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message;
      toast.error(`Translation Failed: ${serverMsg}`);
      setTranslatedText("Error: Could not translate the text.");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (content, isOriginal) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedTranslated(true);
      setTimeout(() => setCopiedTranslated(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-panel p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 animate-pulse">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Studio Translation
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Translate your transcripts across languages instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={isTranslating}
                className="input-glass w-full appearance-none pl-4 pr-10 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="kn">Kannada (KN)</option>
                <option value="ml">Malayalam (ML)</option>
                <option value="mr">Marathi (MR)</option>
                <option value="bn">Bengali (BN)</option>
                <option value="ar">Arabic (AR)</option>
                <option value="te">Telugu (TE)</option>
                <option value="ta">Tamil (TA)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating || !text.trim()}
              className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 group"
            >
              {isTranslating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              )}
              {isTranslating ? "Translating..." : "Translate"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text Input */}
        <div className="glass-panel p-6 flex flex-col h-[400px] lg:h-[600px] border-t-4 border-t-blue-500 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{" "}
              Original Text
            </h2>
            <button
              onClick={() => copyToClipboard(text, true)}
              disabled={!text}
              className="p-2 text-slate-400 hover:text-blue-500 transition-all bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:scale-110"
            >
              {copiedOriginal ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here, or send it directly from the Home page..."
            className="flex-1 w-full bg-transparent resize-none outline-none text-slate-700 dark:text-slate-200 font-medium leading-relaxed custom-scrollbar placeholder:text-slate-400"
          ></textarea>
          <div className="mt-4 text-xs text-slate-400 font-semibold text-right border-t border-slate-100 dark:border-slate-800 pt-3">
            {text.length} characters •{" "}
            {text.split(/\s+/).filter((w) => w.length > 0).length} words
          </div>
        </div>

        {/* Translation Output */}
        <div className="glass-panel p-6 flex flex-col h-[400px] lg:h-[600px] border-t-4 border-t-indigo-500 relative group hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>{" "}
              Translation
            </h2>
            <button
              onClick={() => copyToClipboard(translatedText, false)}
              disabled={!translatedText}
              className="p-2 text-slate-400 hover:text-indigo-500 transition-all bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:scale-110"
            >
              {copiedTranslated ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 w-full bg-transparent overflow-y-auto text-slate-700 dark:text-slate-200 font-semibold leading-loose text-lg custom-scrollbar">
            {isTranslating ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="font-medium">AI is translating...</p>
              </div>
            ) : translatedText ? (
              <div className="whitespace-pre-wrap">{translatedText}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <Globe className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium text-sm">
                  Your translation will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Translate;
