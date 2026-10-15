import { useId } from 'react';
import { MANUAL_DIAGRAMS } from '../content/manualDiagrams';
import type { ManualDiagram, ManualDiagramId } from '../content/manualDiagrams';
import type { Language } from '../types';

/** Inline SVG needs no remote assets/scripts; the caption is also its full text alternative. */
export default function ManualConceptDiagram({ id, language }: { id: ManualDiagramId; language: Language }) {
  const uid = useId();
  const diagram: ManualDiagram = MANUAL_DIAGRAMS[id];
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;
  const arrowId = `${uid}-arrow`;
  return (
    <figure data-manual-diagram={id} className="mt-5 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
      <p id={titleId} className="font-semibold text-slate-900">
        {diagram.title[language]}
      </p>
      <svg
        viewBox={`0 0 320 ${diagram.height}`}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="mx-auto my-3 block w-full max-w-[360px] text-slate-700"
        focusable="false"
      >
        <g aria-hidden="true">
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 Z" fill="currentColor" />
            </marker>
          </defs>
          {diagram.edges.map((edge, index) => (
            <g key={index}>
              <path
                d={edge.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={edge.dashed ? '5 3' : undefined}
                markerEnd={`url(#${arrowId})`}
              />
              {edge.label[language] && (
                <text x={edge.x} y={edge.y} textAnchor="middle" fill="currentColor" fontSize="12">
                  {edge.label[language]}
                </text>
              )}
            </g>
          ))}
          {diagram.nodes.map((node, index) => (
            <g key={index}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height="56"
                rx="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <text
                x={node.x + node.width / 2}
                y={node.y + 23}
                textAnchor="middle"
                fill="currentColor"
                fontSize="14"
                fontWeight="600"
              >
                {node.label[language]}
              </text>
              <text x={node.x + node.width / 2} y={node.y + 43} textAnchor="middle" fill="currentColor" fontSize="12">
                {node.detail[language]}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <figcaption id={descriptionId} className="manual-support-copy text-slate-700">
        {diagram.description[language]}
      </figcaption>
    </figure>
  );
}
