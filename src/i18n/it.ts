/**
 * Canonical Italian UI copy. Content datasets keep their own bilingual domain
 * models; this catalog is for repeated application chrome and shared labels.
 */
export const it = {
  app: {
    loadingModule: 'Caricamento del modulo…',
    skipToContent: 'Vai al contenuto',
    backToOsi: 'Torna alla panoramica OSI',
    footer: 'App didattica · © 2026 Chiara Berti',
  },
  header: {
    openGuide: 'Apri la guida',
    guide: 'Guida',
    language: 'Lingua',
  },
  navigation: {
    label: 'Navigazione dei laboratori',
    search: 'Cerca un laboratorio',
    searchHint: 'Cerca per nome, protocollo o argomento…',
    close: 'Chiudi',
    noResults: 'Nessun laboratorio corrisponde alla ricerca.',
    current: 'Sei qui',
    open: 'Apri il menu',
    results: 'Risultati della ricerca',
    result: 'risultato',
    resultsCount: 'risultati',
    copyLink: 'Copia il link di questo laboratorio',
    linkCopied: 'Link copiato',
  },
  error: {
    chunkTitle: 'Impossibile caricare questa sezione',
    chunkBody: 'Il modulo non è stato scaricato correttamente, probabilmente per un problema di rete temporaneo. I tuoi dati e le tue preferenze non sono andati persi.',
    reload: 'Ricarica la pagina',
    role: 'Messaggio di errore',
  },
  shared: {
    results: 'risultati',
    allPlanes: 'Tutti i piani',
    securityPlane: 'Piano di sicurezza',
    filterScenarios: 'Filtra gli scenari',
    allAreas: 'Tutte le aree',
    techniques: 'Tecniche:',
    noScenarioMatches: 'Nessuno scenario corrisponde ai filtri.',
    controls: 'Controlli',
    defenses: 'Difese:',
    operationalVerification: 'Verifica operativa',
    evidence: 'Evidenze',
    technicalCaveat: 'Limite tecnico',
    threatOrFailureMode: 'Minaccia o failure mode',
    allFamilies: 'Tutte le famiglie',
    horizontalScrollHint: 'Scorri la tabella in orizzontale per vedere tutte le colonne.',
    verificationRule: 'Regola di verifica',
    domains: 'Domini',
    operationalArea: 'Area operativa',
    ccnaDomain: 'Dominio CCNA',
    attackFamily: 'Famiglia di attacco',
    simulationOnly: 'Solo simulazione.',
    normalBehavior: 'Comportamento normale',
  },
} as const;

type WidenStrings<T> = {
  readonly [Key in keyof T]: T[Key] extends string ? string : WidenStrings<T[Key]>;
};

export type UiMessages = WidenStrings<typeof it>;
