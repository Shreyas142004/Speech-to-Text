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
    // Navigate to Home page and pass the transcript in state
    navigate('/', { state: { transcript: item.text, fileName: item.fileName } });
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="dashboard-card p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transcription History</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              View and manage your previously saved transcripts.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <HistoryIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No history found</p>
            <p className="text-sm mt-2 max-w-sm text-center">
              Your recent transcriptions will automatically be saved here for easy access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadHistoryItem(item)}
                className="p-5 bg-slate-50 hover:bg-slate-100 dark:bg-[#09090b] dark:hover:bg-slate-800/80 rounded-2xl cursor-pointer transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 group flex flex-col h-48"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-4">
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
                      {item.date}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                    title="Delete this history item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-blue-400/50 pl-3">
                    "{item.text.substring(0, 180)}{item.text.length > 180 ? '...' : ''}"
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-[#09090b] group-hover:from-slate-100 dark:group-hover:from-slate-800/80 to-transparent pointer-events-none transition-all"></div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Transcript <ArrowRight className="w-4 h-4" />
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
