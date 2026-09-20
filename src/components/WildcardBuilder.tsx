import { useMemo, useState } from 'react';
import { Crosshair, TriangleAlert } from 'lucide-react';
import { wildcardForRange, type WildcardMatch } from '../lib/ipv4';
import { useStore } from '../store';

/**
 * The wildcard, written backwards.
 *
 * Turning a prefix into a wildcard is mechanical, and every calculator does it. The
 * direction that costs marks — and outages — is the one a requirement actually arrives
 * in: "permit only these four management hosts". Here the range is the input and the
 * ACE is the output, including the answer nobody likes: a single wildcard cannot
 * express a range that is not aligned to its own size.
 */

interface Preset {
  id: string;
  label: { it: string; en: string };
  first: string;
  last: string;
}

const PRESETS: Preset[] = [
  { id: 'mgmt', label: { it: '4 host di management', en: '4 management hosts' }, first: '10.1.1.8', last: '10.1.1.11' },
  { id: 'single', label: { it: 'Un solo host', en: 'A single host' }, first: '10.1.1.9', last: '10.1.1.9' },
  { id: 'subnet', label: { it: 'Una /24 intera', en: 'A whole /24' }, first: '10.1.1.0', last: '10.1.1.255' },
  { id: 'misaligned', label: { it: 'Intervallo disallineato', en: 'Misaligned range' }, first: '10.1.1.5', last: '10.1.1.8' },
  { id: 'supernet', label: { it: 'Quattro /24 contigue', en: 'Four contiguous /24s' }, first: '10.1.0.0', last: '10.1.3.255' }
];

const COPY = {
  it: {
    title: 'Wildcard al contrario',
    intro: 'Un requisito non arriva mai come “/28”: arriva come “consenti solo questi host”. Qui l’intervallo è l’ingresso e la ACE è l’uscita — compresa la risposta scomoda quando una sola wildcard non basta.',
    first: 'Primo indirizzo', last: 'Ultimo indirizzo', presets: 'Casi tipici',
    ace: 'ACE da scrivere', prefixEquivalent: 'Prefisso equivalente', wildcard: 'Wildcard mask',
    exact: 'Corrispondenza esatta: questa ACE copre l’intervallo richiesto e nient’altro.',
    inexact: 'Nessuna wildcard copre esattamente questo intervallo.',
    extra: 'Indirizzi in più coinvolti',
    inexactWhy: 'Una wildcard può descrivere solo un blocco allineato alla propria dimensione: il blocco più piccolo che contiene entrambi gli estremi è più largo dell’intervallo chiesto. Hai due strade: accettare gli indirizzi in più (e documentarlo), oppure scrivere più ACE, una per ogni blocco allineato che compone l’intervallo.',
    invalid: 'Inserisci due indirizzi IPv4 validi, con il primo non successivo al secondo.',
    rules: 'Come si legge una wildcard',
    rulesBody: '0 significa “questo bit deve corrispondere”, 1 significa “questo bit è indifferente”. È l’opposto della subnet mask: /28 è 255.255.255.240 come mask e 0.0.0.15 come wildcard. Per ricavarla a mente: 255 meno ogni ottetto della mask.',
    trap: 'Trappola d’esame',
    trapBody: 'La wildcard non deve essere contigua: 0.0.0.254 sui bit bassi corrisponde solo agli indirizzi pari, e si usa per esempio per selezionare gli indirizzi dei router in un piano a /30. Ma attenzione: una mask non contigua è illegale, una wildcard non contigua è legale. Inoltre l’indirizzo scritto nella ACE viene confrontato solo sui bit a 0 della wildcard, quindi 10.1.1.9 0.0.0.3 e 10.1.1.8 0.0.0.3 corrispondono allo stesso blocco.'
  },
  en: {
    title: 'Wildcard, in reverse',
    intro: 'A requirement never arrives as “/28”: it arrives as “permit only these hosts”. Here the range is the input and the ACE is the output — including the uncomfortable answer when one wildcard is not enough.',
    first: 'First address', last: 'Last address', presets: 'Typical cases',
    ace: 'ACE to write', prefixEquivalent: 'Prefix equivalent', wildcard: 'Wildcard mask',
    exact: 'Exact match: this ACE covers the requested range and nothing else.',
    inexact: 'No wildcard covers this range exactly.',
    extra: 'Extra addresses pulled in',
    inexactWhy: 'A wildcard can only describe a block aligned to its own size: the smallest block containing both ends is wider than the range you asked for. You have two options: accept the extra addresses (and document them), or write several ACEs, one per aligned block that makes up the range.',
    invalid: 'Enter two valid IPv4 addresses, with the first not after the second.',
    rules: 'How to read a wildcard',
    rulesBody: '0 means “this bit must match”, 1 means “this bit is irrelevant”. It is the inverse of the subnet mask: /28 is 255.255.255.240 as a mask and 0.0.0.15 as a wildcard. To derive it in your head: 255 minus each octet of the mask.',
    trap: 'Exam trap',
    trapBody: 'A wildcard need not be contiguous: 0.0.0.254 on the low bits matches only even addresses, which is how you select every router address in a /30 plan. But note the asymmetry: a non-contiguous mask is illegal, a non-contiguous wildcard is legal. Also, the address written in the ACE is only compared on the wildcard’s 0 bits, so 10.1.1.9 0.0.0.3 and 10.1.1.8 0.0.0.3 match the same block.'
  }
} as const;

export default function WildcardBuilder() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [first, setFirst] = useState('10.1.1.8');
  const [last, setLast] = useState('10.1.1.11');

  const result = useMemo<{ match: WildcardMatch; error: false } | { match: null; error: true }>(() => {
    try {
      return { match: wildcardForRange(first.trim(), last.trim()), error: false };
    } catch {
      return { match: null, error: true };
    }
  }, [first, last]);

  const inputClass = 'block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
  const match = result.match;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wildcard-title">
      <div className="flex items-center gap-3">
        <Crosshair className="h-5 w-5 text-indigo-600" />
        <h2 id="wildcard-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium text-slate-600">
          {copy.first}
          <input value={first} onChange={(event) => setFirst(event.target.value)} inputMode="decimal" className={inputClass} />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-slate-600">
          {copy.last}
          <input value={last} onChange={(event) => setLast(event.target.value)} inputMode="decimal" className={inputClass} />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.presets}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => { setFirst(preset.first); setLast(preset.last); }}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                first === preset.first && last === preset.last
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {preset.label[language]}
            </button>
          ))}
        </div>
      </div>

      {result.error || !match ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="h-4 w-4 shrink-0" /> {copy.invalid}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg bg-slate-950 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{copy.ace}</p>
            <code className="mt-2 block break-words font-mono text-sm text-emerald-300">
              permit ip {match.address} {match.wildcard} any
            </code>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.wildcard}</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-slate-800">{match.wildcard}</dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.prefixEquivalent}</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-slate-800">/{match.prefix}</dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.extra}</dt>
              <dd className={`mt-1 font-mono text-sm font-semibold ${match.exact ? 'text-emerald-700' : 'text-amber-700'}`}>
                {match.extraAddresses.toLocaleString(language)}
              </dd>
            </div>
          </dl>

          {match.exact ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">{copy.exact}</p>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-900">{copy.inexact}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.inexactWhy}</p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.rules}</h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.rulesBody}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.trap}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{copy.trapBody}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
