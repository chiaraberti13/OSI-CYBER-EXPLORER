import type { Language } from '../types';
import { headerSpecificationFacts } from '../content/headerSpecifications';

interface HeaderSpecificationSummaryProps {
  language: Language;
  layer?: 2 | 3 | 4;
  testId?: string;
}

export default function HeaderSpecificationSummary({
  language,
  layer,
  testId,
}: HeaderSpecificationSummaryProps) {
  const layers = layer ? [layer] : [2, 3, 4] as const;
  const title = language === 'it' ? 'Profilo header e frame' : 'Header and frame profile';
  const layerLabel = language === 'it' ? 'Livello' : 'Layer';

  return (
    <div
      className="rounded-md border border-slate-200/70 bg-white px-3 py-2"
      data-testid={testId}
      aria-label={title}
    >
      {!layer && <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>}
      <div className="space-y-2">
        {layers.map((layerId) => (
          <div key={layerId} className="flex flex-wrap items-center gap-1.5" data-header-layer={layerId}>
            <span className="text-[9px] font-semibold text-slate-400">{layerLabel} {layerId}</span>
            {headerSpecificationFacts(layerId, language).map((fact) => (
              <span
                key={fact.id}
                className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[9px] font-mono text-slate-600"
                data-header-fact={fact.id}
              >
                {fact.label}: <strong className="font-semibold text-slate-800">{fact.value}</strong>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
