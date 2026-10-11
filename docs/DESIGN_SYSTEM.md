# Design system

The interface uses a light, low-distraction canvas with slate text, indigo
navigation and focus, and named feedback colors. `src/index.css` is the single
source for shared color, type, radius, and elevation tokens. Prefer these tokens
or the semantic Tailwind aliases below when adding or changing interface styles;
avoid new one-off hex colors for application chrome or text.

## Tokens

| Purpose        | Token                    | Value     |  Contrast on canvas |
| -------------- | ------------------------ | --------- | ------------------: |
| Page canvas    | `--color-canvas`         | `#fafafa` |                   — |
| Surface        | `--color-surface`        | `#ffffff` |                   — |
| Subtle surface | `--color-surface-subtle` | `#f8fafc` |                   — |
| Primary text   | `--color-ink-primary`    | `#0f172a` |             17.10:1 |
| Secondary text | `--color-ink-secondary`  | `#475569` |              7.26:1 |
| Muted text     | `--color-ink-muted`      | `#64748b` |              4.56:1 |
| Accent / focus | `--color-accent`         | `#4f46e5` |              6.02:1 |
| Strong accent  | `--color-accent-strong`  | `#4338ca` |              7.57:1 |
| Success        | `--color-success`        | `#047857` |              5.25:1 |
| Warning        | `--color-warning`        | `#92400e` |              6.79:1 |
| Error / danger | `--color-danger`         | `#b91c1c` |              6.20:1 |
| Informational  | `--color-info`           | `#0369a1` |              5.68:1 |
| Default border | `--color-stroke`         | `#e2e8f0` | Non-text decoration |

Ratios use the WCAG relative-luminance formula against `#fafafa`. Normal text
and text-sized feedback colors must reach 4.5:1. The values are also checked on
the white and subtle-surface tokens by `npm run verify:design-system`. Color
never carries a state by itself: feedback uses text and/or an icon as well.

Tailwind's frequently used small-text utilities are mapped to semantic values:
`text-slate-400/500`, `text-indigo-500`, `text-emerald-500/600`,
`text-amber-500/600`, and `text-red-500`. This preserves existing class names
while avoiding their default light shades on pale surfaces. New semantic
feedback should use `text-success`, `text-warning`, `text-danger`, or `text-info`.

## Typography and shape

- Sans-serif UI text uses the shared `--font-sans` stack; code and network
  values use `--font-mono`.
- Tailwind's 4 px spacing scale remains the spacing grid. Use its existing
  utilities consistently rather than adding arbitrary pixel spacing.
- `--radius-xl` is the shared 12 px card/panel radius. `--shadow-sm` is the
  restrained default elevation; larger elevation should be reserved for
  overlays and floating controls.
- Keyboard focus uses the 2 px `--color-accent` outline with an offset. Reduced
  motion, the 44 px interactive target floor, and inline-link exceptions are
  documented beside their global rules in `src/index.css`.

## Verification

Run `npm run verify:design-system` after changing tokens. It checks each semantic
text/feedback color against all three light surfaces, confirms the common
low-contrast utility aliases, and guards the global body and focus styles. Run
`npm run verify` for the complete repository gates.

## Italiano

L'interfaccia usa uno sfondo chiaro e poco distraente, testo slate, navigazione e
focus indigo, e colori di feedback con nomi semantici. `src/index.css` è la fonte
unica per i token condivisi di colore, tipografia, raggio e ombra. Quando aggiungi
o modifichi stili, preferisci questi token o le utility semantiche di Tailwind
descritte sopra; evita nuovi colori esadecimali isolati per testi e cornice
dell'applicazione.

### Tipografia e forma

- Il testo dell'interfaccia sans-serif usa lo stack condiviso `--font-sans`; il
  codice e i valori di rete usano `--font-mono`.
- La scala Tailwind da 4 px resta la griglia delle spaziature. Riusa le utility
  esistenti anziché introdurre spaziature arbitrarie in pixel.
- `--radius-xl` è il raggio condiviso di 12 px per schede e pannelli. `--shadow-sm`
  definisce l'ombra discreta predefinita; usa elevazioni maggiori per overlay e
  controlli flottanti.
- Il focus da tastiera usa il contorno da 2 px `--color-accent` con offset. Le
  regole globali in `src/index.css` documentano anche movimento ridotto, target
  interattivi da 44 px ed eccezione per i link nel testo.

### Verifica

Esegui `npm run verify:design-system` dopo ogni modifica ai token. Il controllo
calcola il contrasto di ogni colore semantico per testo e feedback sulle tre
superfici chiare, verifica gli alias delle utility più spesso troppo chiare e
protegge gli stili globali di body e focus. Esegui `npm run verify` per tutti i
gate del repository.
