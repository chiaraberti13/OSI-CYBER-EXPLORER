const LAYER_TERMS_IT: Record<string, string> = {
  'Multi-Layer': 'Multilivello',
  Layers: 'Livelli',
  Layer: 'Livello',
  'upper layers': 'livelli superiori',
  'Application & Port Aware': 'Applicazioni e porte',
  'Application & Operating System': 'Applicazione e sistema operativo',
  'Network & Traffic Analytics': 'Rete e analisi del traffico',
  'Physical & Data Link': 'Fisico e collegamento dati',
  'Data Link & Network': 'Collegamento dati e rete',
  'RF Spectrum': 'Spettro RF',
  'Web Console': 'Console web',
  'Data Link': 'Collegamento dati',
  Network: 'Rete',
  Transport: 'Trasporto',
  Session: 'Sessione',
  Presentation: 'Presentazione',
  Application: 'Applicazione',
  Physical: 'Fisico',
  ' to ': ' a '
};

export function deviceLayerLabel(layer: string, language: 'en' | 'it'): string {
  if (language === 'en') return layer;
  return Object.entries(LAYER_TERMS_IT).reduce(
    (label, [term, translated]) => label.replaceAll(term, translated),
    layer
  );
}
