import { memo } from 'react';
import { ArrowUpRight, Grid3X3 } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_TECHNIQUES, type CcnaDomainId } from '../content/securityCoverage';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';
import type { Language } from '../types';

const COVERAGE_COUNTS = new Map<string, number>();

for (const technique of SECURITY_TECHNIQUES) {
  for (const domain of technique.domains) {
    const key = `${domain}:${technique.familyId}`;
    COVERAGE_COUNTS.set(key, (COVERAGE_COUNTS.get(key) ?? 0) + 1);
  }
}

interface SecurityCoverageMatrixProps {
  language: Language;
  onOpenLab: (domain: CcnaDomainId) => void;
  onSelect: (domain: CcnaDomainId, familyId: string) => void;
}

function SecurityCoverageMatrix({ language, onOpenLab, onSelect }: SecurityCoverageMatrixProps) {
  return (
    <details className="rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Grid3X3 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          {language === 'it' ? 'Matrice dominio × famiglia' : 'Domain × family matrix'}
        </span>
        <span className="text-xs text-slate-500">
          {language === 'it' ? 'Apri per verificare la copertura' : 'Open to inspect coverage'}
        </span>
      </summary>

      <div className="border-t border-slate-100 p-4">
        <p className="mb-4 max-w-4xl text-xs leading-relaxed text-slate-600">
          {language === 'it'
            ? 'Il numero indica quante tecniche collegano il dominio alla famiglia. Seleziona una cella per filtrare il catalogo; il pulsante del dominio apre il laboratorio CCNA corrispondente.'
            : 'The number shows how many techniques link a domain to a family. Select a cell to filter the catalog; the domain button opens the corresponding CCNA lab.'}
        </p>
        <p className="xl:hidden mt-2 text-[11px] text-slate-400" role="note">{language === 'it' ? 'Scorri la tabella in orizzontale per vedere tutte le colonne.' : 'Scroll the table horizontally to see every column.'}</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1080px] border-separate border-spacing-1 text-center text-xs">
            <caption className="sr-only">
              {language === 'it' ? 'Copertura delle famiglie di attacco per dominio CCNA' : 'Attack-family coverage by CCNA domain'}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="p-2 text-left font-semibold text-slate-500">
                  {language === 'it' ? 'Dominio' : 'Domain'}
                </th>
                {ATTACK_FAMILIES.map(family => (
                  <th key={family.id} scope="col" className="max-w-24 p-2 align-bottom font-semibold text-slate-500">
                    <span className="line-clamp-3">{family.name[language]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CCNA_DOMAINS.map(domain => (
                <tr key={domain.id}>
                  <th scope="row" className="p-1 text-left">
                    <button
                      type="button"
                      onClick={() => onOpenLab(domain.id as CcnaDomainId)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <span>{domain.number}. {domain.title[language]}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </button>
                  </th>
                  {ATTACK_FAMILIES.map(family => {
                    const count = COVERAGE_COUNTS.get(`${domain.id}:${family.id}`) ?? 0;
                    const label = language === 'it'
                      ? `${domain.title.it}, ${family.name.it}: ${count} tecniche`
                      : `${domain.title.en}, ${family.name.en}: ${count} techniques`;

                    return (
                      <td key={family.id} className="p-0.5">
                        {count > 0 ? (
                          <button
                            type="button"
                            onClick={() => onSelect(domain.id as CcnaDomainId, family.id)}
                            aria-label={label}
                            className="h-9 w-full rounded-md bg-emerald-50 font-mono font-semibold text-emerald-800 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            {count}
                          </button>
                        ) : (
                          <span className="flex h-9 items-center justify-center rounded-md bg-slate-50 text-slate-300" aria-label={label}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

export default memo(SecurityCoverageMatrix);
