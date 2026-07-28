import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ATTACK_WALKTHROUGHS, ATTACK_SCENARIOS, OSI_LAYERS } from '../constants';
import { AttackWalkthrough, StepActor } from '../types';
import {
  Skull, ShieldCheck, ShieldOff, Server, Play, Pause, RotateCcw, ChevronRight,
  Crosshair, Search, AlertTriangle, CheckCircle2, Radio, Target, Ban
} from 'lucide-react';

const T = {
  it: {
    title: 'Laboratorio Attacco & Difesa',
    subtitle: 'Il laboratorio pratico completo: scegli un attacco, guarda come si svolge passo dopo passo e attiva la difesa per vedere dove e come viene neutralizzato.',
    pick: 'Scegli un attacco',
    search: 'Cerca attacco, tecnica o livello...',
    goal: 'Obiettivo dell\'attaccante',
    attacker: 'Attaccante',
    target: 'Bersaglio',
    defenseOff: 'Difesa: OFF',
    defenseOn: 'Difesa: ON',
    play: 'Riproduci',
    pause: 'Pausa',
    next: 'Passo',
    reset: 'Reset',
    hint: 'Premi Riproduci o avanza un passo alla volta per vedere l\'attacco svilupparsi.',
    killchain: 'Sequenza dell\'attacco',
    defenseCard: 'Contromisura',
    blocked: 'Bloccato dalla difesa',
    outcomeKO: 'Attacco riuscito',
    outcomeOK: 'Attacco neutralizzato',
    layer: 'Livello',
    severity: 'Gravità',
    how: 'Come agisce',
    why: 'Perché funziona',
    replay: 'Rivedi',
    tip: 'Suggerimento: prova lo stesso attacco con la difesa OFF e poi ON per confrontare gli esiti.'
  },
  en: {
    title: 'Attack & Defense Lab',
    subtitle: 'The complete hands-on lab: pick an attack, watch how it unfolds step by step, then turn on the defense to see exactly where and how it gets neutralized.',
    pick: 'Choose an attack',
    search: 'Search attack, technique or layer...',
    goal: 'Attacker\'s goal',
    attacker: 'Attacker',
    target: 'Target',
    defenseOff: 'Defense: OFF',
    defenseOn: 'Defense: ON',
    play: 'Play',
    pause: 'Pause',
    next: 'Step',
    reset: 'Reset',
    hint: 'Press Play, or advance one step at a time, to watch the attack unfold.',
    killchain: 'Attack sequence',
    defenseCard: 'Countermeasure',
    blocked: 'Blocked by the defense',
    outcomeKO: 'Attack succeeded',
    outcomeOK: 'Attack neutralized',
    layer: 'Layer',
    severity: 'Severity',
    how: 'What it does',
    why: 'Why it works',
    replay: 'Replay',
    tip: 'Tip: run the same attack with the defense OFF, then ON, to compare the outcomes.'
  }
};

const SEVERITY_STYLE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};

const ACTOR_STYLE: Record<StepActor, { dot: string; badge: string; label: { it: string; en: string }; Icon: any }> = {
  attacker: { dot: 'bg-red-500', badge: 'text-red-600 bg-red-50 border-red-100', label: { it: 'Attaccante', en: 'Attacker' }, Icon: Skull },
  victim:   { dot: 'bg-blue-500', badge: 'text-blue-600 bg-blue-50 border-blue-100', label: { it: 'Bersaglio', en: 'Target' }, Icon: Server },
  network:  { dot: 'bg-violet-500', badge: 'text-violet-600 bg-violet-50 border-violet-100', label: { it: 'Rete', en: 'Network' }, Icon: Radio },
  defense:  { dot: 'bg-emerald-500', badge: 'text-emerald-600 bg-emerald-50 border-emerald-100', label: { it: 'Difesa', en: 'Defense' }, Icon: ShieldCheck }
};

type TimelineEntry =
  | { kind: 'step'; step: AttackWalkthrough['steps'][number]; index: number; blocked: boolean }
  | { kind: 'defense' }
  | { kind: 'outcome'; success: boolean };

export default function AttackLab() {
  const { language } = useStore();
  const t = T[language];

  const [selectedId, setSelectedId] = useState(ATTACK_WALKTHROUGHS[0].scenarioId);
  const [defenseOn, setDefenseOn] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState('');
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wt = useMemo(
    () => ATTACK_WALKTHROUGHS.find(w => w.scenarioId === selectedId) || ATTACK_WALKTHROUGHS[0],
    [selectedId]
  );
  const scenario = ATTACK_SCENARIOS.find(s => s.id === wt.scenarioId);
  const layerColor = OSI_LAYERS.find(l => l.id === wt.layer)?.color || '#6366f1';

  // Build the ordered timeline based on whether the defense is active.
  const timeline = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [];
    if (defenseOn) {
      wt.steps.forEach((step, i) => {
        if (i === wt.neutralizeAtStep) entries.push({ kind: 'defense' });
        entries.push({ kind: 'step', step, index: i, blocked: i >= wt.neutralizeAtStep });
      });
      entries.push({ kind: 'outcome', success: false });
    } else {
      wt.steps.forEach((step, i) => entries.push({ kind: 'step', step, index: i, blocked: false }));
      entries.push({ kind: 'outcome', success: true });
    }
    return entries;
  }, [wt, defenseOn]);

  const stopPlaying = () => {
    setPlaying(false);
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
  };

  // Reset the walkthrough whenever the attack or the defense state changes.
  useEffect(() => {
    stopPlaying();
    setRevealed(0);
  }, [selectedId, defenseOn]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return;
    playRef.current = setInterval(() => {
      setRevealed(prev => {
        if (prev >= timeline.length) { stopPlaying(); return prev; }
        return prev + 1;
      });
    }, 1100);
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [playing, timeline.length]);

  useEffect(() => () => stopPlaying(), []);

  const atEnd = revealed >= timeline.length;

  const handlePlay = () => {
    if (atEnd) { setRevealed(0); setPlaying(true); return; }
    setPlaying(p => !p);
  };
  const handleNext = () => { stopPlaying(); setRevealed(r => Math.min(r + 1, timeline.length)); };
  const handleReset = () => { stopPlaying(); setRevealed(0); };

  // Attacks grouped by OSI layer (top-down 7 → 1), respecting the search filter.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (w: AttackWalkthrough) => {
      if (!q) return true;
      const sc = ATTACK_SCENARIOS.find(s => s.id === w.scenarioId);
      const hay = [
        sc?.name.it, sc?.name.en, sc?.description.it, sc?.description.en,
        `l${w.layer}`, `livello ${w.layer}`, `layer ${w.layer}`
      ].join(' ').toLowerCase();
      return hay.includes(q);
    };
    const layers = Array.from(new Set(ATTACK_WALKTHROUGHS.map(w => w.layer))).sort((a, b) => b - a);
    return layers
      .map(layer => ({
        layer,
        name: OSI_LAYERS.find(l => l.id === layer)?.translations[language].name || `L${layer}`,
        items: ATTACK_WALKTHROUGHS.filter(w => w.layer === layer && match(w))
      }))
      .filter(g => g.items.length > 0);
  }, [query, language]);

  const nameOf = (id: string) => ATTACK_SCENARIOS.find(s => s.id === id)?.name[language] || id;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative px-6 md:px-8 py-7 bg-slate-950 text-white overflow-hidden">
        <div className="absolute -right-8 -top-10 opacity-[0.06] pointer-events-none">
          <Crosshair className="w-56 h-56" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-3">
            <Target className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
              {language === 'it' ? 'Attacco → Difesa' : 'Attack → Defense'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">{t.title}</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: attack picker */}
        <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/40">
          <div className="p-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{t.pick}</p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="max-h-[420px] lg:max-h-[640px] overflow-y-auto custom-scrollbar p-3 space-y-4">
            {grouped.map(group => (
              <div key={group.layer}>
                <div className="flex items-center gap-2 px-1 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: OSI_LAYERS.find(l => l.id === group.layer)?.color }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    L{group.layer} · {group.name}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map(w => {
                    const active = w.scenarioId === selectedId;
                    return (
                      <button
                        key={w.scenarioId}
                        onClick={() => setSelectedId(w.scenarioId)}
                        aria-pressed={active}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                          active
                            ? 'bg-white border-indigo-300 text-slate-900 shadow-sm'
                            : 'bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                        }`}
                      >
                        <span className="truncate">{nameOf(w.scenarioId)}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${SEVERITY_STYLE[w.severity]}`}>
                          {w.severity}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right: the theater */}
        <section className="lg:col-span-8 xl:col-span-9 p-5 md:p-7">
          {/* Attack meta */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className="text-[10px] font-black uppercase px-2 py-1 rounded-md text-white"
                  style={{ backgroundColor: layerColor }}
                >
                  {t.layer} {wt.layer}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${SEVERITY_STYLE[wt.severity]}`}>
                  {t.severity}: {wt.severity}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{nameOf(wt.scenarioId)}</h2>
              <div className="mt-2 flex items-start gap-2 max-w-xl">
                <Crosshair className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">{t.goal}: </span>{wt.goal[language]}
                </p>
              </div>
            </div>

            {/* Defense toggle */}
            <button
              onClick={() => setDefenseOn(v => !v)}
              aria-pressed={defenseOn}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 font-black text-sm uppercase tracking-wide transition-all shadow-sm ${
                defenseOn
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {defenseOn ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
              {defenseOn ? t.defenseOn : t.defenseOff}
            </button>
          </div>

          {/* Stage: attacker → target with shield */}
          <div className={`relative rounded-2xl border p-5 mb-5 overflow-hidden transition-colors ${
            atEnd && !defenseOn ? 'border-red-200 bg-red-50/40'
            : atEnd && defenseOn ? 'border-emerald-200 bg-emerald-50/40'
            : 'border-slate-200 bg-slate-50/60'
          }`}>
            <div className="flex items-center justify-between gap-3">
              {/* Attacker */}
              <div className="flex flex-col items-center gap-1.5 w-24">
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                  <Skull className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.attacker}</span>
              </div>

              {/* Path */}
              <div className="flex-1 relative h-12 flex items-center">
                <div className="w-full h-0.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className={defenseOn ? 'h-full bg-emerald-500' : 'h-full bg-red-500'}
                    initial={false}
                    animate={{ width: `${Math.min(100, (revealed / Math.max(1, timeline.length)) * 100)}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                {/* Shield in the middle */}
                <div className="absolute left-1/2 -translate-x-1/2">
                  <motion.div
                    initial={false}
                    animate={{ scale: defenseOn ? 1 : 0.85, opacity: defenseOn ? 1 : 0.35 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      defenseOn ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-300'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>

              {/* Target */}
              <div className="flex flex-col items-center gap-1.5 w-24">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors ${
                  atEnd && !defenseOn ? 'bg-red-600 text-white shadow-red-500/20'
                  : 'bg-slate-800 text-white'
                }`}>
                  <Server className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.target}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              {atEnd ? t.replay : playing ? t.pause : t.play}
            </button>
            <button
              onClick={handleNext}
              disabled={atEnd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:border-slate-300 disabled:opacity-30 transition-all"
            >
              {t.next}<ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              aria-label={t.reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-wider transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 ml-1">
              {Math.min(revealed, timeline.length)}/{timeline.length}
            </span>
          </div>

          {/* Kill chain */}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.killchain}</p>

          {revealed === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <p className="text-sm text-slate-500 font-medium">{t.hint}</p>
              <p className="text-xs text-slate-400 mt-2">{t.tip}</p>
            </div>
          )}

          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {timeline.slice(0, revealed).map((entry, i) => {
                if (entry.kind === 'defense') {
                  return (
                    <motion.div
                      key={`defense-${wt.scenarioId}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{t.defenseCard}</span>
                        <span className="text-sm font-black text-emerald-900">· {wt.defense.name[language]}</span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 pl-9">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 mb-0.5">{t.how}</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{wt.defense.action[language]}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 mb-0.5">{t.why}</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{wt.defense.mechanism[language]}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                if (entry.kind === 'outcome') {
                  const ok = !entry.success; // success:false means blocked (defense on)
                  return (
                    <motion.div
                      key={`outcome-${wt.scenarioId}-${defenseOn}`}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-xl border-2 p-4 flex items-start gap-3 ${
                        ok ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
                        {ok ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-wide ${ok ? 'text-emerald-700' : 'text-red-700'}`}>
                          {ok ? t.outcomeOK : t.outcomeKO}
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                          {ok ? wt.outcomeBlocked[language] : wt.outcomeSuccess[language]}
                        </p>
                      </div>
                    </motion.div>
                  );
                }

                // step
                const actor = ACTOR_STYLE[entry.step.actor];
                const ActorIcon = actor.Icon;
                return (
                  <motion.div
                    key={`step-${wt.scenarioId}-${entry.index}-${defenseOn}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-xl border p-4 flex gap-3 ${
                      entry.blocked ? 'border-slate-200 bg-slate-50/60 opacity-60' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${actor.dot}`}>
                        <ActorIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400">{entry.index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${actor.badge}`}>
                          {actor.label[language]}
                        </span>
                        <h4 className={`text-sm font-bold ${entry.blocked ? 'text-slate-500 line-through decoration-red-300' : 'text-slate-900'}`}>
                          {entry.step.title[language]}
                        </h4>
                        {entry.blocked && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <Ban className="w-2.5 h-2.5" />{t.blocked}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{entry.step.detail[language]}</p>
                      {entry.step.packet && (
                        <div className="mt-2 inline-block bg-slate-900 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded">
                          {entry.step.packet}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
