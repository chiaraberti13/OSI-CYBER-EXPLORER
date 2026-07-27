import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Play, Shield, MousePointer2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'it' | 'en';
}

export default function GuideModal({ isOpen, onClose, language }: GuideModalProps) {
  const content = {
    en: {
      title: 'How to use the Lab',
      steps: [
        { icon: MousePointer2, title: 'Explore Layers', desc: 'Click the OSI layers on the left to see theory, protocols, and vulnerabilities on the right.' },
        { icon: Play, title: 'Simulate Traffic', desc: 'Choose a protocol (HTTP/PING) and start. Watch headers being added (Encapsulation) and removed (Decapsulation).' },
        { icon: Shield, title: 'Cybersecurity Test', desc: 'Inject attacks like MitM or Spoofing. Toggle Defense to see how mitigation works in real-time.' },
      ],
      close: 'Got it!'
    },
    it: {
      title: 'Come usare il Laboratorio',
      steps: [
        { icon: MousePointer2, title: 'Esplora i Livelli', desc: 'Clicca i livelli OSI a sinistra per vedere teoria, protocolli e vulnerabilità sulla destra.' },
        { icon: Play, title: 'Simula Traffico', desc: 'Scegli un protocollo (HTTP/PING) e avvia. Osserva gli Header che vengono aggiunti e rimossi.' },
        { icon: Shield, title: 'Test Cybersecurity', desc: 'Inietta attacchi come MitM o Spoofing. Attiva la Difesa per vedere la mitigazione in tempo reale.' },
      ],
      close: 'Ho capito!'
    }
  }[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white border border-slate-100 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[85vh] m-auto"
          >
            <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-100 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full z-20 bg-slate-900/40 md:bg-transparent">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Cyberpunk Repository Banner */}
            <div className="relative w-full h-44 md:h-52 rounded-2xl overflow-hidden mb-6 border border-slate-100 shadow-inner">
              <img 
                src="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop" 
                alt="Cyberpunk Lab Terminal" 
                className="w-full h-full object-cover brightness-[0.75] contrast-[1.15]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent flex items-end p-6">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.25em] block mb-1">
                    OSI_CYBER_LAB // SECURITY_REPOSITORY_MANUAL_v2.5
                  </span>
                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-white">
                    {language === 'en' ? 'Laboratory Directory & Guide' : 'Manuale & Repository di Rete'}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8 mt-6">
              {content.steps.map((step, i) => (
                <div key={i} className="flex gap-4 md:gap-6 group">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                    <step.icon className="w-5 h-5 md:w-7 md:h-7 text-emerald-600" />
                  </div>
                  <div className="pt-0.5 md:pt-1">
                    <h3 className="font-black text-slate-900 text-sm md:text-base uppercase mb-0.5 md:mb-1">{step.title}</h3>
                    <p className="text-slate-500 text-xs md:text-base leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-8 md:mt-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 md:py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs md:text-sm"
            >
              {content.close}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
