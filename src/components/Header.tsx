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
          {/* App mark: a stack of OSI layers on the brand tile, the top layer cyan
              (the cyber accent). Identical to the favicon so tab and header match. */}
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
            <rect x="1" y="1" width="30" height="30" rx="7.5" fill="#4f46e5" />
            <rect x="8.5" y="9.4" width="15" height="3.1" rx="1.55" fill="#22d3ee" />
            <rect x="8.5" y="14.45" width="15" height="3.1" rx="1.55" fill="#ffffff" />
            <rect x="8.5" y="19.5" width="15" height="3.1" rx="1.55" fill="#ffffff" opacity="0.7" />
          </svg>
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
