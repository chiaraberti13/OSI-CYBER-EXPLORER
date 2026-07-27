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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-lg shadow-sm animate-pulse">
            <div className="w-4 h-4 border-2 border-white rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 uppercase tracking-[0.2em] text-xs">
              OSI_LAB <span className="text-slate-400">v2.5</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Status: Optimized</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'it' ? 'Guida del Lab' : 'Lab Guide'}</span>
          </button>

          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('it')}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${language === 'it' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              IT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
