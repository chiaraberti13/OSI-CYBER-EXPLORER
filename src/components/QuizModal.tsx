import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Trophy, ChevronRight, RotateCcw, GraduationCap } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../constants';
import { useStore } from '../store';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ isOpen = false, onClose = () => {}, inline = false }: { isOpen?: boolean; onClose?: () => void; inline?: boolean }) {
  const { language, quizScore, incrementQuizScore, resetQuizScore } = useStore();
  const [sessionQuestions, setSessionQuestions] = useState<typeof QUIZ_QUESTIONS>(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || sessionQuestions.length === 0) return;
    setSelectedOption(index);
    if (index === sessionQuestions[currentQuestion].correctAnswer) {
      incrementQuizScore();
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < sessionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setSessionQuestions(shuffled.slice(0, 5));
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setQuizFinished(false);
    resetQuizScore();
  };

  const getRank = () => {
    const total = sessionQuestions.length || 5;
    const percentage = (quizScore / total) * 100;
    if (percentage === 100) return { en: 'Network Architect', it: 'Architetto di Rete' };
    if (percentage >= 80) return { en: 'Senior Engineer', it: 'Ingegnere Senior' };
    if (percentage >= 60) return { en: 'SysAdmin', it: 'Amministratore di Sistema' };
    return { en: 'Junior Technician', it: 'Tecnico Junior' };
  };

  if (sessionQuestions.length === 0) {
    if (inline) {
      return (
        <div className="relative bg-white rounded-3xl border border-slate-200 flex items-center justify-center w-full h-[82vh] min-h-[600px] shadow-sm">
          <div className="text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto animate-bounce animate-duration-1000">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-500">
              {language === 'en' ? 'Loading Quiz...' : 'Caricamento Quiz...'}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const renderWrapper = (children: React.ReactNode) => {
    if (inline) {
      return (
        <div className="relative bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden w-full h-[82vh] min-h-[600px] shadow-sm">
          {children}
        </div>
      );
    }
    return (
      <AnimatePresence>
        {isOpen && sessionQuestions.length > 0 && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl z-[111] flex flex-col overflow-hidden w-full max-w-2xl h-auto max-h-[90vh] border border-slate-100"
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return renderWrapper(
    <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {language === 'en' ? 'Quiz' : 'Quiz'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {quizFinished 
                      ? (language === 'en' ? 'Results Summary' : 'Riepilogo Risultati')
                      : (language === 'en' ? `Question ${currentQuestion + 1} of ${sessionQuestions.length}` : `Domanda ${currentQuestion + 1} di ${sessionQuestions.length}`)}
                  </p>
                </div>
              </div>
              {!inline && (
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {!quizFinished ? (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                    {sessionQuestions[currentQuestion].question[language]}
                  </h3>

                  <div className="grid gap-4">
                    {sessionQuestions[currentQuestion].options.map((option, idx) => {
                      const isCorrect = idx === sessionQuestions[currentQuestion].correctAnswer;
                      const isSelected = idx === selectedOption;
                      
                      let appearance = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50";
                      if (showResult) {
                        if (isCorrect) appearance = "border-emerald-500 bg-emerald-50 text-emerald-900";
                        else if (isSelected) appearance = "border-red-500 bg-red-50 text-red-900";
                        else appearance = "opacity-50 border-slate-200";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={showResult}
                          onClick={() => handleOptionSelect(idx)}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all group ${appearance}`}
                        >
                          <span className="font-semibold">{option[language]}</span>
                          {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          {showResult && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-red-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {showResult && (
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex gap-3 text-left shadow-sm animate-in fade-in zoom-in-95 duration-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-mono text-xs font-black shadow-md shadow-indigo-100">
                          T
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                            {language === 'en' ? "Tutor's Explanation" : "Spiegazione del Tutor"}
                          </span>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            {sessionQuestions[currentQuestion]?.explanation?.[language]}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                      >
                        <button
                          onClick={nextQuestion}
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                        >
                          {currentQuestion === sessionQuestions.length - 1 
                            ? (language === 'en' ? 'View Results' : 'Vedi Risultati')
                            : (language === 'en' ? 'Next Question' : 'Prossima Domanda')}
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 space-y-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 text-amber-600 rounded-full mb-4"
                  >
                    <Trophy className="w-12 h-12" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">
                      {language === 'en' ? 'Quiz Completed!' : 'Quiz Completato!'}
                    </h3>
                    <p className="text-slate-500 font-medium">
                      {language === 'en' 
                        ? `You scored ${quizScore} out of ${sessionQuestions.length}` 
                        : `Hai ottenuto ${quizScore} su ${sessionQuestions.length}`}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 max-w-sm mx-auto">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">
                       {language === 'en' ? 'Network Rank' : 'Grado di Rete'}
                    </p>
                    <p className="text-2xl font-black text-indigo-600 uppercase">
                      {getRank()[language]}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                    >
                      <RotateCcw className="w-5 h-5" />
                      {language === 'en' ? 'Retake Quiz' : 'Rifai il Quiz'}
                    </button>
                    <button
                      onClick={inline ? () => useStore.getState().setActiveView('osi') : onClose}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                    >
                      {inline ? (language === 'en' ? 'Back to OSI Lab' : 'Torna al Lab OSI') : (language === 'en' ? 'Close Quiz' : 'Chiudi Quiz')}
                    </button>
                  </div>
                </div>
              )}
            </div>
    </>
  );
}
