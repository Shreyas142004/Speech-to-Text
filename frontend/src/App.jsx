import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Mic, Moon, Sun, History as HistoryIcon, Home as HomeIcon, Globe } from 'lucide-react';
import Home from './pages/Home';
import History from './pages/History';
import Translate from './pages/Translate';

function Navigation() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.theme === 'dark') {
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-full max-w-5xl flex justify-between items-center mb-10 mt-2">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20">
          <Mic className="w-5 h-5" />
        </div>
        <h1 className="font-bold text-2xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Speech-To-Text Converter
        </h1>
      </Link>
      
      <div className="flex items-center gap-4 glass-pill p-1.5">
        <nav className="flex gap-1">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              isActive('/') 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <HomeIcon className="w-4 h-4" /> Home
          </Link>
          <Link 
            to="/translate" 
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              isActive('/translate') 
                ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" /> Translate
          </Link>
          <Link 
            to="/history" 
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              isActive('/history') 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <HistoryIcon className="w-4 h-4" /> History
          </Link>
        </nav>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
        
        <button 
          onClick={toggleTheme} 
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all mr-1"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gradient-background min-h-screen p-4 md:p-8 flex flex-col items-center">
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            className: 'glass-pill font-medium',
            style: { color: 'inherit', background: 'var(--tw-bg-opacity)' } 
          }} 
        />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
