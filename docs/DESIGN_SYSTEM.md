# Design system

The interface uses the approved "OSI Cyber Explorer v2" visual system: a light,
low-distraction canvas with near-black ink, indigo navigation and focus, a cyan
in-flight accent and named feedback colors. `src/index.css` is the single source
for shared color, type, radius, and elevation tokens. Prefer these tokens or the
semantic Tailwind aliases below when adding or changing interface styles; avoid
new one-off hex colors for application chrome or text.

## Tokens

| Purpose             | Token                    | Value     |  Contrast on canvas |
| ------------------- | ------------------------ | --------- | ------------------: |
| Page canvas         | `--color-canvas`         | `#f5f6f8` |                   — |
| Surface             | `--color-surface`        | `#ffffff` |                   — |
| Subtle surface      | `--color-surface-subtle` | `#f0f2f5` |                   — |
| Primary text        | `--color-ink-primary`    | `#0d1220` |             17.27:1 |
| Secondary text      | `--color-ink-secondary`  | `#353c4a` |             10.24:1 |
| Muted text          | `--color-ink-muted`      | `#5b6474` |              5.52:1 |
| Accent / focus      | `--color-accent`         | `#4f46e5` |              5.81:1 |
| Strong accent       | `--color-accent-strong`  | `#3f37c9` |              7.47:1 |
| Success             | `--color-success`        | `#0f7a4f` |              4.96:1 |
| Warning             | `--color-warning`        | `#8f5300` |              5.70:1 |
| Error / danger      | `--color-danger`         | `#b4232a` |              6.04:1 |
| Informational       | `--color-info`           | `#0369a1` |              5.49:1 |
| Transforming (cyan) | `--color-cyan`           | `#0a7489` |              5.02:1 |
| Default border      | `--color-stroke`         | `#e3e6eb` | Non-text decoration |
| Strong border       | `--color-stroke-strong`  | `#cfd4dc` | Non-text decoration |

Each feedback color also ships a pale background tint for cards and chips —
`--color-accent-soft`, `--color-success-soft`, `--color-warning-soft`,
`--color-danger-soft` and `--color-cyan-soft` — which are decorative fills, not
text. The always-dark console/terminal uses `--color-code-bg`, `--color-code-ink`
and `--color-code-dim`. Each OSI layer has a three-part palette
(`--color-layer-<1..7>`, plus `-ink` for AA text-on-light and `-tint` for a pale
fill) so the stack, inspector and layer chrome keep a consistent per-layer identity.

Ratios use the WCAG relative-luminance formula against `#f5f6f8`. Normal text
and text-sized feedback colors must reach 4.5:1. The values are also checked on
the white and subtle-surface tokens by `npm run verify:design-system`. Color
never carries a state by itself: feedback uses text and/or an icon as well.

Tailwind's frequently used small-text utilities are mapped to semantic values:
`text-slate-400/500`, `text-indigo-500`, `text-emerald-500/600`,
`text-amber-500/600`, and `text-red-500`. This preserves existing class names
while avoiding their default light shades on pale surfaces. New semantic
feedback should use `text-success`, `text-warning`, `text-danger`, or `text-info`.

## Typography and shape

- Sans-serif UI text uses the shared `--font-sans` stack — Instrument Sans, the
  approved interface face, with Inter and the system stack as fallbacks; code and
  network values use `--font-mono` (JetBrains Mono). Both web fonts are loaded in
  `index.html` with `display=swap` so fallbacks render immediately.
- Long-form manual theory uses `--manual-body-size` (16 px),
  `--manual-body-leading` (1.75 / 28 px) and a `--manual-reading-measure` cap of
  72 characters. Its card column is capped at 75 characters so 24 px desktop
  padding does not stretch running text; supporting lists and examples use a
  consistent 14/24 px rhythm.
- Tailwind's 4 px spacing scale remains the spacing grid. Use its existing
  utilities consistently rather than adding arbitrary pixel spacing.
- `--radius-xl` is the shared 12 px radius for controls and menus; primary
  panels use Tailwind's `rounded-2xl` (16 px). `--shadow-sm` is the restrained
  default elevation and `--shadow-card` the soft card elevation; larger elevation
  is reserved for overlays and floating controls.
- Keyboard focus uses the 2 px `--color-accent` outline with an offset. Reduced
  motion, the 44 px interactive target floor, and inline-link exceptions are
  documented beside their global rules in `src/index.css`.
- Manual navigation exposes the active chapter as `aria-current="page"` and the
  active topic as `aria-current="location"`. A chapter change moves focus to
  its level-two heading; programmatic scrolling must use the shared motion
  helper so `prefers-reduced-motion` replaces smooth animation with instant
  scrolling.

## Verification

Run `npm run verify:design-system` after changing tokens. It checks each semantic
text/feedback color against all three light surfaces, confirms the common
low-contrast utility aliases, and guards the global body and focus styles. Run
`npm run verify` for the complete repository gates.

## Italiano

L'interfaccia adotta il sistema visivo approvato «OSI Cyber Explorer v2»: sfondo
chiaro e poco distraente, inchiostro quasi nero, navigazione e focus indigo, un
accento cyan per lo stato «in trasformazione» e colori di feedback con nomi
semantici. `src/index.css` è la fonte unica per i token condivisi di colore,
tipografia, raggio e ombra (i valori e la tabella completa sono nella sezione
inglese sopra). Quando aggiungi o modifichi stili, preferisci questi token o le
utility semantiche di Tailwind descritte sopra; evita nuovi colori esadecimali
isolati per testi e cornice dell'applicazione. Ogni livello OSI ha una palette in
tre parti (`--color-layer-<1..7>`, con `-ink` e `-tint`), e la console scura usa
`--color-code-bg/ink/dim`.

### Tipografia e forma

- Il testo dell'interfaccia sans-serif usa lo stack condiviso `--font-sans` —
  Instrument Sans, il carattere d'interfaccia approvato, con Inter e lo stack di
  sistema come fallback; il codice e i valori di rete usano `--font-mono`
  (JetBrains Mono). Entrambi i web font sono caricati in `index.html` con
  `display=swap`, così i fallback compaiono subito.
- La teoria estesa del Manuale usa `--manual-body-size` (16 px),
  `--manual-body-leading` (1,75 / 28 px) e una misura massima di 72 caratteri
  (`--manual-reading-measure`). La colonna delle card è limitata a 75 caratteri,
  così il padding desktop da 24 px non allarga il testo corrente; liste ed esempi
  di supporto condividono il ritmo 14/24 px.
- La scala Tailwind da 4 px resta la griglia delle spaziature. Riusa le utility
  esistenti anziché introdurre spaziature arbitrarie in pixel.
- `--radius-xl` è il raggio condiviso di 12 px per controlli e menu; i pannelli
  principali usano `rounded-2xl` di Tailwind (16 px). `--shadow-sm` è l'ombra
  discreta predefinita e `--shadow-card` l'ombra morbida delle schede; usa
  elevazioni maggiori per overlay e controlli flottanti.
- Il focus da tastiera usa il contorno da 2 px `--color-accent` con offset. Le
  regole globali in `src/index.css` documentano anche movimento ridotto, target
  interattivi da 44 px ed eccezione per i link nel testo.
- La navigazione del Manuale espone il capitolo attivo con
  `aria-current="page"` e l'argomento attivo con `aria-current="location"`. Il
  cambio di capitolo porta il focus sul relativo titolo di livello due; lo
  scorrimento programmato deve usare l'helper condiviso per sostituire
  l'animazione fluida con uno spostamento immediato quando è attivo
  `prefers-reduced-motion`.

### Verifica

Esegui `npm run verify:design-system` dopo ogni modifica ai token. Il controllo
calcola il contrasto di ogni colore semantico per testo e feedback sulle tre
superfici chiare, verifica gli alias delle utility più spesso troppo chiare e
protegge gli stili globali di body e focus. Esegui `npm run verify` per tutti i
gate del repository.
