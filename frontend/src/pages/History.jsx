import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { History as HistoryIcon, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('transcriptionHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('transcriptionHistory', JSON.stringify(updatedHistory));
    toast.success("History item deleted.");
  };

  const loadHistoryItem = (item) => {
    navigate('/', { state: { transcript: item.text, fileName: item.fileName } });
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-panel p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Transcription History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              View and manage your previously saved transcripts locally.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-4">
              <HistoryIcon className="w-16 h-16 opacity-30 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">No history found</p>
            <p className="text-sm mt-2 max-w-sm text-center font-medium">
              Your recent transcriptions will automatically be saved here for easy access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadHistoryItem(item)}
                className="p-6 bg-white/40 hover:bg-white/70 dark:bg-slate-900/40 dark:hover:bg-slate-800/80 rounded-3xl cursor-pointer transition-all duration-300 border border-white/50 dark:border-slate-700/50 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-500/50 group flex flex-col h-56 relative overflow-hidden"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-400/10 rounded-full blur-[50px] group-hover:bg-blue-400/20 transition-all duration-500 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate w-full block">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold tracking-wide mt-1 uppercase">
                      {item.date}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="opacity-40 group-hover:opacity-100 p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 flex-shrink-0 shadow-sm"
                    title="Delete this history item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden relative z-10">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    "{item.text.substring(0, 180)}{item.text.length > 180 ? '...' : ''}"
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 group-hover:from-white dark:from-slate-900/90 dark:group-hover:from-slate-800 to-transparent pointer-events-none transition-all duration-300"></div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
                  Open Transcript <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
