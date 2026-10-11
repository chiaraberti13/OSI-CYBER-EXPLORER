import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { BookOpen } from 'lucide-react';
import { uiMessages } from '../i18n';

export default function Header() {
  const { language, setLanguage, setIsGuideOpen } = useStore(
    useShallow((state) => ({
      language: state.language,
      setLanguage: state.setLanguage,
      setIsGuideOpen: state.setIsGuideOpen
    }))
  );
  const copy = uiMessages(language).header;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-canvas/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 border border-slate-300 flex items-center justify-center rounded-md">
            <div className="w-2.5 h-2.5 border border-slate-900 rotate-45" />
          </div>
          <span className="font-medium text-slate-900 text-sm tracking-tight">
            <span className="hidden min-[360px]:inline">OSI Cyber Explorer</span>
            <span className="min-[360px]:hidden">OSI</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            aria-haspopup="dialog"
            aria-label={copy.openGuide}
            className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-3 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            <BookOpen aria-hidden="true" className="w-4 h-4" />
            <span className="hidden sm:inline">{copy.guide}</span>
          </button>

          <div className="flex bg-slate-100 p-0.5 rounded-lg" role="group" aria-label={copy.language}>
            <button
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              aria-label="English"
              className={`min-h-11 min-w-11 px-2.5 text-xs font-medium rounded-md transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('it')}
              aria-pressed={language === 'it'}
              aria-label="Italiano"
              className={`min-h-11 min-w-11 px-2.5 text-xs font-medium rounded-md transition-all ${language === 'it' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              IT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
