import { useStore } from '../store';
import { BookOpen } from 'lucide-react';

export default function Header() {
  const { 
    language, 
    setLanguage,
    setIsGuideOpen
  } = useStore();

  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-900 flex items-center justify-center rounded-lg">
            <div className="w-3.5 h-3.5 border-2 border-white rotate-45" />
          </div>
          <h1 className="font-semibold text-slate-900 text-sm tracking-tight">
            OSI Cyber Explorer
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'it' ? 'Guida' : 'Guide'}</span>
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-lg" role="group" aria-label={language === 'it' ? 'Lingua' : 'Language'}>
            <button
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              aria-label="English"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('it')}
              aria-pressed={language === 'it'}
              aria-label="Italiano"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${language === 'it' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              IT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
