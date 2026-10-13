/**
 * Canonical Italian UI copy. Content datasets keep their own bilingual domain
 * models; this catalog is for repeated application chrome and shared labels.
 */
export const it = {
  app: {
    loadingModule: 'Caricamento del modulo…',
    loadingManual: 'Caricamento del manuale di studio…',
    skipToContent: 'Vai al contenuto',
    backToOsi: 'Torna alla panoramica OSI',
    footer: 'App didattica · © 2026 Chiara Berti'
  },
  header: {
    openGuide: 'Apri la guida',
    guide: 'Guida',
    language: 'Lingua'
  },
  hub: {
    eyebrow: 'Percorso CCNA',
    label: 'Sezioni del percorso CCNA',
    overview: 'Panoramica',
    chapters: 'Capitoli'
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
    scrollLabsLeft: 'Scorri i laboratori verso sinistra',
    scrollLabsRight: 'Scorri i laboratori verso destra'
  },
  manual: {
    heading: 'Manuale di studio',
    intro: 'Gli argomenti da studiare, spiegati in modo progressivo e collegati ai laboratori interattivi.',
    helpTitle: 'Come usare questa guida',
    helpNavigationTitle: 'Scegli e orientati',
    helpNavigationBody:
      'Scegli un capitolo dall’indice per dominio CCNA. Usa «In questa pagina» su desktop o «Contenuti del capitolo» su mobile per raggiungere un argomento.',
    helpLabsTitle: 'Metti in pratica',
    helpLabsBody:
      'Leggi la spiegazione, poi prova la consegna e la sfida del laboratorio guidato. Apri il laboratorio interattivo e confronta il risultato con la soluzione commentata e l’autoverifica.',
    helpChaptersTitle: 'Prosegui nello studio',
    helpChaptersBody:
      'A fine capitolo usa «Capitolo precedente» e «Capitolo successivo». Segna i capitoli completati: il progresso rimane in questo browser.',
    dismissHelp: 'Chiudi le istruzioni',
    chapters: 'capitoli',
    topics: 'argomenti',
    guidedLabs: 'laboratori guidati',
    objectives: 'Obiettivi',
    prerequisites: 'Prerequisiti',
    commonMistakes: 'Errori comuni',
    example: 'Esempio',
    explanation: 'Spiegazione',
    tableOfContents: 'Contenuti del capitolo',
    onThisPage: 'In questa pagina',
    chapterContext: 'Contesto del capitolo',
    markChapterComplete: 'Segna come completato',
    markChapterIncomplete: 'Segna come da completare',
    completedChapter: 'Completato',
    chapterProgress: 'Progresso capitoli',
    resetProgress: 'Azzera progresso',
    progressStoredLocally: 'Il progresso viene salvato solo in questo browser.',
    chapterStepNav: 'Capitolo precedente e successivo',
    previousChapter: 'Capitolo precedente',
    nextChapter: 'Capitolo successivo',
    references: 'Riferimenti',
    studyInLab: 'Studia nel laboratorio',
    guidedLab: 'Laboratorio guidato',
    scenario: 'Scenario',
    task: 'Consegna',
    steps: 'Passi guidati',
    challenge: 'Sfida autonoma',
    showSolution: 'Mostra la soluzione commentata',
    solution: 'Soluzione commentata',
    selfCheck: 'Autoverifica',
    doGuidedExercise: 'Fai l’esercizio guidato',
    chapterNav: 'Capitoli del manuale',
    chapterSelector: 'Vai a un capitolo',
    mobileChapterNav: 'Navigazione mobile del manuale',
    difficultyIntro: 'Introduttivo',
    difficultyCore: 'Fondamentale',
    difficultyAdvanced: 'Avanzato',
    certCcna: 'CCNA 200-301',
    certSecurityPlus: 'CompTIA Security+ SY0-701',
    certBoth: 'CCNA 200-301 · Security+ SY0-701',
    certEjpt: 'eJPT (INE/eLearnSecurity)',
    trackExtension: 'Estensione',
    examWeight: 'Peso d’esame'
  },
  error: {
    chunkTitle: 'Impossibile caricare questa sezione',
    chunkBody:
      'Il modulo non è stato scaricato correttamente, probabilmente per un problema di rete temporaneo. I tuoi dati e le tue preferenze non sono andati persi.',
    reload: 'Ricarica la pagina',
    role: 'Messaggio di errore'
  },
  labManual: {
    label: 'Teoria nel manuale',
    intro: 'Qui ti alleni: la spiegazione completa di questo argomento vive nel manuale di studio.',
    openOne: 'Apri il capitolo',
    openMany: 'Apri i capitoli'
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
    normalBehavior: 'Comportamento normale'
  }
} as const;

type WidenStrings<T> = {
  readonly [Key in keyof T]: T[Key] extends string ? string : WidenStrings<T[Key]>;
};

export type UiMessages = WidenStrings<typeof it>;
