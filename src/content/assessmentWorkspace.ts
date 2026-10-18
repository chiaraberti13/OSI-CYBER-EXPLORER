import type { Bilingual } from '../types';

export type AssessmentPhaseId = 'osint' | 'discovery' | 'enumeration' | 'os-hypothesis' | 'assessment';
export type EvidenceKind = 'observation' | 'hypothesis';
export type OsHypothesis = 'linux-like' | 'windows-like' | 'unknown';

export interface AssessmentEvidence {
  id: string;
  phase: AssessmentPhaseId;
  kind: EvidenceKind;
  source: string;
  observedOn: string;
  confidence: number;
  statement: Bilingual;
}

export interface AssessmentFinding {
  id: string;
  title: Bilingual;
  evidenceId: string;
  exposure: number;
  impact: number;
  confidence: number;
  rationale: Bilingual;
  validation: Bilingual;
}

export const ASSESSMENT_SCOPE = {
  target: '192.0.2.10/32',
  hostname: 'web-01.example.test',
  observedOn: '2026-10-18',
  authorization: {
    it: 'Autorizzazione didattica valida esclusivamente per le fixture locali di questo workspace.',
    en: 'Teaching authorization applies exclusively to this workspace’s local fixtures.'
  },
  rules: {
    it: 'Un solo target documentale RFC 5737; niente scansioni reali, richieste di rete, credenziali, exploitation o attività fuori scope.',
    en: 'One RFC 5737 documentation target; no real scans, network requests, credentials, exploitation, or out-of-scope activity.'
  }
} as const;

export const ASSESSMENT_PHASES: readonly { id: AssessmentPhaseId; title: Bilingual; objective: Bilingual }[] = [
  {
    id: 'osint',
    title: { it: 'OSINT da fixture', en: 'Fixture OSINT' },
    objective: {
      it: 'Raccogliere impronta organizzativa e tecnica simulata annotando fonte, data e attendibilità.',
      en: 'Collect simulated organizational and technical footprint while recording source, date, and confidence.'
    }
  },
  {
    id: 'discovery',
    title: { it: 'Host discovery', en: 'Host discovery' },
    objective: {
      it: 'Distinguere l’asset incluso nello scope da un indirizzo esplicitamente escluso.',
      en: 'Distinguish the in-scope asset from an explicitly excluded address.'
    }
  },
  {
    id: 'enumeration',
    title: { it: 'Porte e servizi', en: 'Ports and services' },
    objective: {
      it: 'Collegare porte, servizi e risposte della fixture senza inviare sonde.',
      en: 'Associate ports, services, and fixture responses without sending probes.'
    }
  },
  {
    id: 'os-hypothesis',
    title: { it: 'Ipotesi sul sistema operativo', en: 'Operating-system hypothesis' },
    objective: {
      it: 'Formulare un’inferenza motivata e conservarla distinta da un fatto osservato.',
      en: 'Form a reasoned inference and keep it distinct from an observed fact.'
    }
  },
  {
    id: 'assessment',
    title: { it: 'Vulnerability assessment', en: 'Vulnerability assessment' },
    objective: {
      it: 'Valutare esposizione, impatto e attendibilità; indicare quando verificare prima di dichiarare una vulnerabilità.',
      en: 'Assess exposure, impact, and confidence; identify when to validate before claiming a vulnerability.'
    }
  }
];

export const ASSESSMENT_EVIDENCE: readonly AssessmentEvidence[] = [
  {
    id: 'OSINT-01',
    phase: 'osint',
    kind: 'observation',
    source: 'fixture://osint/org-profile.json',
    observedOn: ASSESSMENT_SCOPE.observedOn,
    confidence: 100,
    statement: {
      it: 'Il profilo fittizio dichiara il servizio web di laboratorio e il contatto tecnico role-based security@example.test; non identifica persone reali.',
      en: 'The fictional profile lists the lab web service and the role-based technical contact security@example.test; it identifies no real people.'
    }
  },
  {
    id: 'OSINT-02',
    phase: 'osint',
    kind: 'observation',
    source: 'fixture://dns/certificate-records.json',
    observedOn: ASSESSMENT_SCOPE.observedOn,
    confidence: 90,
    statement: {
      it: 'Record DNS e certificato simulati associano web-01.example.test a 192.0.2.10; example.test e l’indirizzo appartengono a fixture documentali, non a un’organizzazione reale.',
      en: 'Simulated DNS and certificate records associate web-01.example.test with 192.0.2.10; example.test and the address belong to documentation fixtures, not a real organization.'
    }
  },
  {
    id: 'DISC-01',
    phase: 'discovery',
    kind: 'observation',
    source: 'fixture://discovery/host-snapshot.json',
    observedOn: ASSESSMENT_SCOPE.observedOn,
    confidence: 100,
    statement: {
      it: 'La fixture marca 192.0.2.10 come host presente e autorizzato; 198.51.100.20 è escluso e il workspace rifiuta di aggiungerlo all’asset inventory.',
      en: 'The fixture marks 192.0.2.10 as present and authorized; 198.51.100.20 is excluded and the workspace refuses to add it to the asset inventory.'
    }
  },
  {
    id: 'ENUM-01',
    phase: 'enumeration',
    kind: 'observation',
    source: 'fixture://services/web-01.json',
    observedOn: ASSESSMENT_SCOPE.observedOn,
    confidence: 100,
    statement: {
      it: 'La fixture riporta TCP/443 open con HTTPS, un banner sintetico EDU-Web/1.0 e TTL iniziale 64; TCP/22 risulta filtrata. Il TTL osservato può essere decrementato dai router e gli indizi dello stack sono deboli. Gli stati sono dati preregistrati, non il risultato di uno scan.',
      en: 'The fixture records TCP/443 open with HTTPS, a synthetic EDU-Web/1.0 banner, and an initial TTL of 64; TCP/22 is filtered. The observed TTL may be decremented by routers, and stack clues are weak. These states are preloaded data, not the result of a scan.'
    }
  },
  {
    id: 'ASSESS-01',
    phase: 'assessment',
    kind: 'observation',
    source: 'fixture://config/tls-policy.json',
    observedOn: ASSESSMENT_SCOPE.observedOn,
    confidence: 100,
    statement: {
      it: 'La configurazione di laboratorio dichiara TLS 1.0 abilitato sul servizio HTTPS sintetico; il rilievo descrive solo questa fixture.',
      en: 'The lab configuration declares TLS 1.0 enabled on the synthetic HTTPS service; this finding describes this fixture only.'
    }
  },
  {
    id: 'ASSESS-02',
    phase: 'assessment',
    kind: 'observation',
    source: 'fixture://services/web-01.json',
    observedOn: ASSESSMENT_SCOPE.observedOn,
    confidence: 100,
    statement: {
      it: 'Lo stesso banner EDU-Web/1.0 non documenta lo stato delle patch: la versione richiede correlazione e verifica, non prova da sola una vulnerabilità.',
      en: 'The EDU-Web/1.0 banner does not document patch status: the version requires correlation and validation and does not by itself prove a vulnerability.'
    }
  }
];

export const ASSESSMENT_FINDINGS: readonly AssessmentFinding[] = [
  {
    id: 'F-01',
    title: { it: 'TLS 1.0 abilitato nella configurazione fixture', en: 'TLS 1.0 enabled in fixture configuration' },
    evidenceId: 'ASSESS-01',
    exposure: 5,
    impact: 4,
    confidence: 5,
    rationale: {
      it: 'Il servizio HTTPS è raggiungibile nella fixture e il file di configurazione dichiara esplicitamente il protocollo legacy.',
      en: 'The HTTPS service is reachable in the fixture and its configuration file explicitly declares the legacy protocol.'
    },
    validation: {
      it: 'Validare le versioni effettivamente negoziate su sistemi autorizzati e verificare la compatibilità prima della remediation.',
      en: 'Validate the versions actually negotiated on authorized systems and check compatibility before remediation.'
    }
  },
  {
    id: 'F-02',
    title: { it: 'Stato patch del banner da verificare', en: 'Banner patch status requires validation' },
    evidenceId: 'ASSESS-02',
    exposure: 5,
    impact: 4,
    confidence: 2,
    rationale: {
      it: 'Il banner identifica soltanto un’etichetta sintetica; non fornisce release, advisory o stato delle patch.',
      en: 'The banner identifies only a synthetic label; it provides no release, advisory, or patch status.'
    },
    validation: {
      it: 'Non dichiarare una CVE: richiedere inventario autenticato o advisory del vendor e correlare una release precisa.',
      en: 'Do not claim a CVE: request an authenticated inventory or vendor advisory and correlate a precise release.'
    }
  }
];

export const confidencePercent = (confidence: number): number => Math.max(0, Math.min(100, Math.round(confidence)));

export const calculateTriageIndex = (finding: Pick<AssessmentFinding, 'exposure' | 'impact' | 'confidence'>): number =>
  finding.exposure * finding.impact * finding.confidence;

export const triagePriority = (index: number): 'P1' | 'P2' | 'P3' => (index >= 80 ? 'P1' : index >= 35 ? 'P2' : 'P3');

export const buildAssessmentReport = (evidence: readonly AssessmentEvidence[]): string => {
  const orderedEvidence = [...evidence].sort(
    (left, right) =>
      ASSESSMENT_PHASES.findIndex((phase) => phase.id === left.phase) -
        ASSESSMENT_PHASES.findIndex((phase) => phase.id === right.phase) ||
      left.observedOn.localeCompare(right.observedOn) ||
      left.id.localeCompare(right.id)
  );
  const orderedFindings = ASSESSMENT_FINDINGS.map((finding) => ({
    ...finding,
    index: calculateTriageIndex(finding)
  })).sort((left, right) => right.index - left.index);
  const render = (language: 'it' | 'en') => [
    language === 'it' ? '# Report assessment (simulazione)' : '# Assessment report (simulation)',
    '',
    language === 'it' ? '## Scope e autorizzazione' : '## Scope and authorization',
    `- ${language === 'it' ? 'Target' : 'Target'}: ${ASSESSMENT_SCOPE.hostname} (${ASSESSMENT_SCOPE.target})`,
    `- ${language === 'it' ? 'Data fixture' : 'Fixture date'}: ${ASSESSMENT_SCOPE.observedOn}`,
    `- ${ASSESSMENT_SCOPE.authorization[language]}`,
    `- ${ASSESSMENT_SCOPE.rules[language]}`,
    '',
    language === 'it' ? '## Evidenze' : '## Evidence',
    ...orderedEvidence.flatMap((item) => [
      `- [${item.id}] ${item.kind === 'observation' ? (language === 'it' ? 'Osservazione' : 'Observation') : language === 'it' ? 'Ipotesi' : 'Hypothesis'}: ${item.statement[language]} ${language === 'it' ? 'Fonte' : 'Source'}: ${item.source}; ${language === 'it' ? 'data' : 'date'}: ${item.observedOn}; ${language === 'it' ? 'confidenza' : 'confidence'}: ${confidencePercent(item.confidence)}%.`
    ]),
    '',
    language === 'it' ? '## Priorità di triage' : '## Triage priorities',
    language === 'it'
      ? 'Indice didattico esposizione × impatto × confidenza (1–5); non è CVSS e non è una misura universale del rischio.'
      : 'Teaching index: exposure × impact × confidence (1–5); it is not CVSS and is not a universal risk measure.',
    ...orderedFindings.map(
      (finding) =>
        `- ${triagePriority(finding.index)} · ${finding.title[language]}: ${finding.index}/125 (E ${finding.exposure}, I ${finding.impact}, C ${finding.confidence}). ${finding.rationale[language]} ${finding.validation[language]}`
    ),
    '',
    language === 'it'
      ? 'Nessuna richiesta è stata inviata a host o servizi. Validare ogni rilievo nel perimetro autorizzato prima di dichiararlo confermato.'
      : 'No requests were sent to hosts or services. Validate each finding within the authorized scope before calling it confirmed.'
  ];
  return [...render('it'), '', '---', '', ...render('en')].join('\n');
};
