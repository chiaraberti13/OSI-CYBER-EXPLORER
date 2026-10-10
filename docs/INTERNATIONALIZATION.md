# UI internationalization

## English

Repeated application labels live in the typed catalogs `src/i18n/it.ts` and
`src/i18n/en.ts`. Domain content remains in its structured bilingual datasets:
the UI catalog is intentionally limited to application chrome, errors,
navigation, and labels shared by multiple views.

### Adding or changing a label

1. Add the key and Italian value to `it.ts`.
2. Add the equivalent English value to `en.ts`.
3. Read it with `uiMessages(language)`; use a named formatter from
   `src/i18n/index.ts` when grammar depends on a value.
4. Run `npm run typecheck` and `npm test`.

`UiMessages` is derived from the Italian source catalog. The English object
uses `satisfies UiMessages`, so TypeScript rejects a missing or misspelled key.
`catalog.test.ts` independently compares the complete leaf-key sets, rejects
blank labels, and checks the count formatter in both languages.

The project does not use `react-i18next`: both languages are bundled, there is
one small catalog, and no remote loading or namespace lifecycle is needed. This
decision should be revisited if plural rules become complex, catalogs need
dynamic loading, or independently owned namespaces emerge.

## Italiano

Le etichette ripetute dell'applicazione risiedono nei cataloghi tipizzati
`src/i18n/it.ts` e `src/i18n/en.ts`. I contenuti di dominio restano nei rispettivi
dataset bilingui strutturati: il catalogo UI è intenzionalmente limitato a
guscio dell'app, errori, navigazione ed etichette condivise tra più viste.

### Aggiungere o modificare un'etichetta

1. Aggiungere chiave e valore italiano in `it.ts`.
2. Aggiungere il valore inglese equivalente in `en.ts`.
3. Leggerlo con `uiMessages(language)`; usare un formatter nominato da
   `src/i18n/index.ts` quando la grammatica dipende da un valore.
4. Eseguire `npm run typecheck` e `npm test`.

`UiMessages` deriva dal catalogo sorgente italiano. L'oggetto inglese usa
`satisfies UiMessages`, quindi TypeScript rifiuta chiavi mancanti o errate.
`catalog.test.ts` confronta inoltre tutti i percorsi foglia, rifiuta etichette
vuote e verifica il formatter dei risultati in entrambe le lingue.

Il progetto non usa `react-i18next`: entrambe le lingue sono incluse nel bundle,
il catalogo è unico e contenuto e non servono caricamento remoto o lifecycle dei
namespace. La scelta va rivalutata se le regole di plurale diventano complesse,
i cataloghi devono essere caricati dinamicamente o emergono namespace gestiti
in modo indipendente.
