import { useMemo, useState } from 'react';
import { Bot, Braces, GitBranch, Network, ShieldCheck, TriangleAlert } from 'lucide-react';
import { inspectJsonDocument, httpMethodProfile, httpStatusFamily, type HttpMethod } from '../lib/automation';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';

type Language = 'it' | 'en';
type Localized = Record<Language, string>;

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const ARCHITECTURE_ROWS: Array<{ title: string; detail: Localized }> = [
  { title: 'Traditional networking', detail: { it: 'Control plane e data plane risiedono normalmente su ogni dispositivo. La configurazione è distribuita e spesso applicata device-by-device tramite CLI o protocolli di gestione.', en: 'Control and data planes normally reside on each device. Configuration is distributed and often applied device by device through CLI or management protocols.' } },
  { title: 'Controller-based networking', detail: { it: 'Il controller mantiene una vista logica centralizzata, traduce intenti/policy e programma i dispositivi. I forwarding device continuano a inoltrare nel data plane.', en: 'The controller maintains a centralized logical view, translates intent/policy, and programs devices. Forwarding devices continue to forward in the data plane.' } },
  { title: 'Underlay', detail: { it: 'Rete IP fisica che fornisce reachability tra nodi e tunnel endpoint. Deve convergere in modo stabile prima dell’overlay.', en: 'Physical IP network that provides reachability between nodes and tunnel endpoints. It must converge reliably before the overlay.' } },
  { title: 'Overlay', detail: { it: 'Topologia logica costruita sopra l’underlay con tunnel e segmenti virtuali; può separare tenant e policy dalla topologia fisica.', en: 'Logical topology built over the underlay with tunnels and virtual segments; it can separate tenants and policy from physical topology.' } },
  { title: 'Fabric', detail: { it: 'Sistema coordinato di underlay, overlay, controller, policy e automazione che offre connettività e segmentazione coerenti.', en: 'Coordinated system of underlay, overlay, controller, policy, and automation that provides consistent connectivity and segmentation.' } },
  { title: 'Northbound / southbound APIs', detail: { it: 'Northbound collega controller e applicazioni/intent; southbound collega controller e infrastruttura tramite protocolli o API come NETCONF/RESTCONF.', en: 'Northbound connects controllers to applications/intent; southbound connects controllers to infrastructure through protocols or APIs such as NETCONF/RESTCONF.' } }
];

const CONFIG_MANAGEMENT: Array<{ tool: string; model: Localized; data: Localized; distinction: Localized }> = [
  { tool: 'Ansible', model: { it: 'Agentless, tipicamente push', en: 'Agentless, typically push' }, data: { it: 'Playbook YAML, inventory e moduli', en: 'YAML playbooks, inventory, and modules' }, distinction: { it: 'Usa SSH/API/NETCONF; i moduli dovrebbero convergere in modo idempotente.', en: 'Uses SSH/API/NETCONF; modules should converge idempotently.' } },
  { tool: 'Puppet', model: { it: 'Agent-based, tipicamente pull', en: 'Agent-based, typically pull' }, data: { it: 'Manifest dichiarativi', en: 'Declarative manifests' }, distinction: { it: 'L’agent converge periodicamente verso il catalogo desiderato.', en: 'The agent periodically converges toward the desired catalog.' } },
  { tool: 'Chef', model: { it: 'Agent-based, tipicamente pull', en: 'Agent-based, typically pull' }, data: { it: 'Recipe e cookbook', en: 'Recipes and cookbooks' }, distinction: { it: 'Descrive la configurazione con recipe eseguite dal client.', en: 'Describes configuration through recipes executed by the client.' } },
  { tool: 'Terraform', model: { it: 'Dichiarativo, plan/apply', en: 'Declarative, plan/apply' }, data: { it: 'HCL, provider e state', en: 'HCL, providers, and state' }, distinction: { it: 'Gestisce lifecycle e dipendenze delle risorse; lo state è sensibile e va protetto.', en: 'Manages resource lifecycle and dependencies; state is sensitive and must be protected.' } }
];

const DATA_FORMATS: Array<{ name: string; detail: Localized }> = [
  { name: 'JSON', detail: { it: 'Oggetti, array, stringhe, numeri, boolean e null. Comune nelle REST API; non supporta commenti nello standard.', en: 'Objects, arrays, strings, numbers, booleans, and null. Common in REST APIs; standard JSON has no comments.' } },
  { name: 'XML', detail: { it: 'Elementi, attributi e namespace; usato da NETCONF con modelli YANG. È verboso ma fortemente strutturato.', en: 'Elements, attributes, and namespaces; used by NETCONF with YANG models. Verbose but strongly structured.' } },
  { name: 'YAML', detail: { it: 'Formato leggibile basato su indentazione, comune in playbook e pipeline. Spazi e conversioni implicite richiedono attenzione.', en: 'Human-readable indentation-based format common in playbooks and pipelines. Whitespace and implicit conversion require care.' } },
  { name: 'YANG', detail: { it: 'Linguaggio di modellazione, non formato di trasporto: definisce struttura, tipi, vincoli e operazioni dei dati gestiti.', en: 'A modeling language, not a transport format: it defines structure, types, constraints, and operations for managed data.' } }
];

const AI_ML_ROWS: Array<{ title: Localized; benefit: Localized; risk: Localized }> = [
  { title: { it: 'Anomaly detection', en: 'Anomaly detection' }, benefit: { it: 'Individua deviazioni in telemetria, flussi, RF e comportamento dei client.', en: 'Finds deviations in telemetry, flows, RF, and client behavior.' }, risk: { it: 'Baseline contaminate, drift e falsi positivi possono degradare la qualità.', en: 'Contaminated baselines, drift, and false positives may degrade quality.' } },
  { title: { it: 'Assurance e previsione', en: 'Assurance and prediction' }, benefit: { it: 'Correla eventi, stima capacità e anticipa guasti o peggioramento delle prestazioni.', en: 'Correlates events, estimates capacity, and anticipates failures or performance degradation.' }, risk: { it: 'Correlazione non implica causalità; decisioni automatiche richiedono soglie e rollback.', en: 'Correlation does not imply causation; automated decisions require thresholds and rollback.' } },
  { title: { it: 'Assistenti generativi', en: 'Generative assistants' }, benefit: { it: 'Riassumono log, propongono query e generano bozze di configurazione o documentazione.', en: 'Summarize logs, propose queries, and draft configurations or documentation.' }, risk: { it: 'Allucinazioni, prompt injection e dati sensibili impongono validazione, isolamento e approvazione umana.', en: 'Hallucinations, prompt injection, and sensitive data require validation, isolation, and human approval.' } }
];

const SECURITY_ROWS: Array<{ threat: Localized; impact: Localized; defense: Localized }> = [
  { threat: { it: 'Token/API key nel codice o nel repository', en: 'Token/API key stored in code or a repository' }, impact: { it: 'Accesso persistente alle API e possibile controllo dell’infrastruttura.', en: 'Persistent API access and possible infrastructure control.' }, defense: { it: 'Secret manager, token brevi e scoped, rotazione, secret scanning e workload identity.', en: 'Secret managers, short-lived scoped tokens, rotation, secret scanning, and workload identity.' } },
  { threat: { it: 'Broken authentication o authorization', en: 'Broken authentication or authorization' }, impact: { it: 'Un’identità accede a oggetti o azioni fuori dal proprio ruolo.', en: 'An identity accesses objects or actions outside its role.' }, defense: { it: 'RBAC/ABAC server-side, deny by default, object-level authorization, MFA e test negativi.', en: 'Server-side RBAC/ABAC, deny by default, object-level authorization, MFA, and negative tests.' } },
  { threat: { it: 'Input non validato e mass assignment', en: 'Unvalidated input and mass assignment' }, impact: { it: 'Campi inattesi modificano configurazioni o iniettano dati nei backend.', en: 'Unexpected fields alter configurations or inject data into backends.' }, defense: { it: 'Schema allowlist, type/range validation, canonicalizzazione e output encoding.', en: 'Allowlisted schemas, type/range validation, canonicalization, and output encoding.' } },
  { threat: { it: 'Replay o intercettazione API', en: 'API replay or interception' }, impact: { it: 'Richieste valide vengono lette, modificate o ripetute.', en: 'Valid requests are read, modified, or replayed.' }, defense: { it: 'TLS/mTLS, nonce o timestamp dove previsti, firma delle richieste e protezione delle chiavi.', en: 'TLS/mTLS, nonces or timestamps where supported, request signing, and key protection.' } },
  { threat: { it: 'Rate abuse e resource exhaustion', en: 'Rate abuse and resource exhaustion' }, impact: { it: 'Controller o API diventano lenti o indisponibili.', en: 'Controllers or APIs become slow or unavailable.' }, defense: { it: 'Rate limit per identità, quote, pagination, timeout, circuit breaker e capacity monitoring.', en: 'Per-identity rate limits, quotas, pagination, timeouts, circuit breakers, and capacity monitoring.' } },
  { threat: { it: 'Compromissione del controller', en: 'Controller compromise' }, impact: { it: 'Il punto di coordinamento amplia il blast radius su molti dispositivi.', en: 'The coordination point expands the blast radius across many devices.' }, defense: { it: 'Segmentazione management, HA, hardening, MFA/PAM, backup, audit immutabile e least privilege.', en: 'Management segmentation, HA, hardening, MFA/PAM, backups, immutable auditing, and least privilege.' } },
  { threat: { it: 'Errore di automazione su larga scala', en: 'Large-scale automation error' }, impact: { it: 'Una modifica valida sintatticamente interrompe molti device contemporaneamente.', en: 'A syntactically valid change disrupts many devices at once.' }, defense: { it: 'Lint/schema, unit e integration test, dry-run, peer approval, canary, maintenance window e rollback.', en: 'Linting/schema checks, unit and integration tests, dry runs, peer approval, canaries, maintenance windows, and rollback.' } },
  { threat: { it: 'Supply-chain di moduli e immagini', en: 'Module and image supply chain' }, impact: { it: 'Dipendenze o artifact compromessi eseguono codice nel sistema di automazione.', en: 'Compromised dependencies or artifacts execute code in the automation system.' }, defense: { it: 'Version pinning, SBOM, firme, repository attendibili, scanning e runner isolati.', en: 'Version pinning, SBOMs, signatures, trusted repositories, scanning, and isolated runners.' } },
  { threat: { it: 'Telemetry o training-data poisoning', en: 'Telemetry or training-data poisoning' }, impact: { it: 'Assurance e modelli AI apprendono baseline false o producono decisioni scorrette.', en: 'Assurance systems and AI models learn false baselines or produce incorrect decisions.' }, defense: { it: 'Provenienza, autenticazione dei sensori, data-quality checks, modelli monitorati e human-in-the-loop.', en: 'Provenance, sensor authentication, data-quality checks, monitored models, and human-in-the-loop.' } },
  { threat: { it: 'Configuration drift', en: 'Configuration drift' }, impact: { it: 'Lo stato reale diverge dall’intento e crea esposizioni o risultati non riproducibili.', en: 'Actual state diverges from intent, creating exposure or non-reproducible outcomes.' }, defense: { it: 'Source of truth, reconciliation, diff periodici, policy-as-code e change ownership.', en: 'A source of truth, reconciliation, periodic diffs, policy as code, and change ownership.' } }
];

const SAMPLE_JSON = `{
  "hostname": "R1",
  "interfaces": [
    { "name": "GigabitEthernet0/0", "enabled": true, "mtu": 1500 }
  ],
  "routing": { "ospfProcess": 10, "area": 0 }
}`;

const AUTOMATION_EXAMPLES: Record<Language, string> = {
  it: `# REST: credenziale letta da un secret manager, non dal codice
curl --fail --silent --show-error \\
  -H "Authorization: Bearer $API_TOKEN" \\
  -H "Accept: application/json" \\
  https://controller.example/api/v1/devices

# Ansible: prima dry-run/check, poi rollout a lotti
ansible-playbook network.yml --check --diff
ansible-playbook network.yml --limit canary`,
  en: `# REST: credential obtained from a secret manager, not source code
curl --fail --silent --show-error \\
  -H "Authorization: Bearer $API_TOKEN" \\
  -H "Accept: application/json" \\
  https://controller.example/api/v1/devices

# Ansible: dry-run/check first, then a batched rollout
ansible-playbook network.yml --check --diff
ansible-playbook network.yml --limit canary`
};

function SectionTitle({ icon: Icon, title, id }: { icon: typeof Network; title: string; id: string }) {
  return <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-600" /><h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2></div>;
}

export default function AutomationLab() {
  const language = useStore(state => state.language);
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [resource, setResource] = useState('/api/v1/devices/R1');
  const [status, setStatus] = useState(200);
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);

  const jsonInspection = useMemo(() => {
    try {
      const inspection = inspectJsonDocument(jsonInput);
      return { nodes: inspection.nodes, sensitive: inspection.sensitivePaths, error: false } as const;
    } catch {
      return { nodes: [], sensitive: [], error: true } as const;
    }
  }, [jsonInput]);
  const profile = httpMethodProfile(method);
  const statusFamily = httpStatusFamily(status);

  const t = language === 'it'
    ? {
        title: 'Automation & Programmability Lab', subtitle: 'Dall’architettura controller-based alla pipeline sicura: interpreta API e dati prima di automatizzare il cambiamento.', architecture: 'Architetture e API',
        rest: 'REST request explorer', method: 'Metodo HTTP', resource: 'Resource URI', status: 'Status simulato', crud: 'Operazione CRUD', safe: 'Safe', idempotent: 'Idempotente', success: 'Successi tipici', yes: 'Sì', no: 'No', restNote: 'Safe significa che il metodo non dovrebbe modificare lo stato. Idempotente significa che ripetere la stessa richiesta produce lo stesso stato finale; non garantisce una risposta identica.',
        statusHelp: '401 indica autenticazione assente/non valida; 403 indica identità riconosciuta ma non autorizzata; 409 segnala spesso un conflitto; 429 rate limit.', json: 'JSON inspector', invalidJson: 'JSON non valido o oltre i limiti didattici.', path: 'JSONPath', type: 'Tipo', value: 'Valore', sensitive: 'Possibili segreti rilevati nelle chiavi', sensitiveNote: 'Il rilevamento è euristico: i valori non vengono mostrati nel warning e non sostituisce un secret scanner.',
        formats: 'Formati e modelli dei dati', config: 'Configuration management', property: 'Modello', representation: 'Rappresentazione', distinction: 'Caratteristica', ai: 'AI/ML nelle operazioni di rete', benefit: 'Beneficio', risk: 'Rischio e controllo', security: 'Minacce dell’automazione e difese', threat: 'Minaccia', impact: 'Impatto', defense: 'Difesa', examples: 'Esempi operativi sicuri'
      }
    : {
        title: 'Automation & Programmability Lab', subtitle: 'From controller-based architecture to a secure pipeline: interpret APIs and data before automating change.', architecture: 'Architectures and APIs',
        rest: 'REST request explorer', method: 'HTTP method', resource: 'Resource URI', status: 'Simulated status', crud: 'CRUD operation', safe: 'Safe', idempotent: 'Idempotent', success: 'Typical success', yes: 'Yes', no: 'No', restNote: 'Safe means the method should not modify state. Idempotent means repeating the same request produces the same final state; it does not guarantee an identical response.',
        statusHelp: '401 means missing/invalid authentication; 403 means a recognized identity lacks authorization; 409 often signals conflict; 429 is rate limiting.', json: 'JSON inspector', invalidJson: 'Invalid JSON or teaching limits exceeded.', path: 'JSONPath', type: 'Type', value: 'Value', sensitive: 'Possible secrets detected in keys', sensitiveNote: 'Detection is heuristic: values are not shown in the warning, and this does not replace a secret scanner.',
        formats: 'Data formats and models', config: 'Configuration management', property: 'Model', representation: 'Representation', distinction: 'Characteristic', ai: 'AI/ML in network operations', benefit: 'Benefit', risk: 'Risk and control', security: 'Automation threats and defenses', threat: 'Threat', impact: 'Impact', defense: 'Defense', examples: 'Secure operational examples'
      };

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><p className="eyebrow">CCNA 6.1 · 6.2 · 6.3 · 6.4 · 6.5 · 6.6 · 6.7</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p></header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="architecture-title"><SectionTitle icon={Network} title={t.architecture} id="architecture-title" /><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{ARCHITECTURE_ROWS.map(row => <article key={row.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="rest-title"><SectionTitle icon={GitBranch} title={t.rest} id="rest-title" /><div className="mt-5 grid gap-3 md:grid-cols-[150px_1fr_160px]"><label className="space-y-1 text-xs text-slate-600">{t.method}<select value={method} onChange={event => setMethod(event.target.value as HttpMethod)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm">{HTTP_METHODS.map(item => <option key={item}>{item}</option>)}</select></label><label className="space-y-1 text-xs text-slate-600">{t.resource}<input value={resource} onChange={event => setResource(event.target.value)} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1 text-xs text-slate-600">{t.status}<input type="number" min={100} max={599} value={status} onChange={event => setStatus(Math.min(599, Math.max(100, Number(event.target.value))))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label></div><p className="mt-4 break-all rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-300">{method} https://controller.example{resource.startsWith('/') ? resource : `/${resource}`}</p><dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.crud}</dt><dd className="mt-1 font-mono text-xs font-semibold">{profile.crud}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.safe}</dt><dd className="mt-1 text-xs font-semibold">{profile.safe ? t.yes : t.no}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.idempotent}</dt><dd className="mt-1 text-xs font-semibold">{profile.idempotent ? t.yes : t.no}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.success}</dt><dd className="mt-1 font-mono text-xs font-semibold">{profile.typicalSuccess.join(' · ')}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">HTTP {status}</dt><dd className="mt-1 font-mono text-xs font-semibold">{statusFamily}</dd></div></dl><p className="mt-4 text-xs leading-relaxed text-slate-600">{t.restNote}</p><p className="mt-2 text-xs leading-relaxed text-slate-600">{t.statusHelp}</p></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="json-title"><SectionTitle icon={Braces} title={t.json} id="json-title" /><textarea value={jsonInput} onChange={event => setJsonInput(event.target.value)} spellCheck={false} aria-label={t.json} className="mt-4 h-52 w-full rounded-lg border border-slate-200 p-3 font-mono text-xs leading-relaxed outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />{jsonInspection.error ? <p className="mt-3 flex items-center gap-2 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalidJson}</p> : <><p className="md:hidden mt-2 text-[11px] text-slate-400" role="note">{language === 'it' ? 'Scorri la tabella in orizzontale per vedere tutte le colonne.' : 'Scroll the table horizontally to see every column.'}</p><div className="mt-4 max-h-80 overflow-auto rounded-lg border border-slate-200"><table className="w-full min-w-[620px] text-left text-xs"><thead className="sticky top-0 bg-slate-50 text-slate-500"><tr><th className="p-3">{t.path}</th><th className="p-3">{t.type}</th><th className="p-3">{t.value}</th></tr></thead><tbody>{jsonInspection.nodes.map(node => <tr key={node.path} className="border-t border-slate-100"><td className="p-3 font-mono text-indigo-700">{node.path}</td><td className="p-3 font-mono text-slate-500">{node.type}</td><td className="max-w-sm truncate p-3 font-mono text-slate-700">{jsonInspection.sensitive.includes(node.path) ? '[REDACTED]' : node.value}</td></tr>)}</tbody></table></div>{jsonInspection.sensitive.length > 0 ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><p className="font-semibold">{t.sensitive}: {jsonInspection.sensitive.join(' · ')}</p><p className="mt-1.5">{t.sensitiveNote}</p></div> : null}</>}</section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="formats-title"><SectionTitle icon={Braces} title={t.formats} id="formats-title" /><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{DATA_FORMATS.map(row => <article key={row.name} className="rounded-lg border border-slate-200 p-4"><h3 className="font-mono text-sm font-semibold text-indigo-700">{row.name}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="config-management-title"><SectionTitle icon={GitBranch} title={t.config} id="config-management-title" /><div className="mt-4"><ResponsiveTable
        rows={CONFIG_MANAGEMENT}
        rowKey={row => row.tool}
        label={t.config}
        minWidth={850}
        columns={[
          { id: 'tool', header: 'Tool', heading: true, cellClassName: 'text-indigo-700', cell: row => row.tool },
          { id: 'model', header: t.property, cell: row => row.model[language] },
          { id: 'data', header: t.representation, cell: row => row.data[language] },
          { id: 'distinction', header: t.distinction, cell: row => row.distinction[language] }
        ]}
      /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ai-title"><SectionTitle icon={Bot} title={t.ai} id="ai-title" /><div className="mt-4 grid gap-3 lg:grid-cols-3">{AI_ML_ROWS.map(row => <article key={row.title.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.title[language]}</h3><p className="mt-2 text-xs leading-relaxed text-emerald-800"><strong>{t.benefit}:</strong> {row.benefit[language]}</p><p className="mt-2 text-xs leading-relaxed text-rose-800"><strong>{t.risk}:</strong> {row.risk[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="automation-security-title"><SectionTitle icon={ShieldCheck} title={t.security} id="automation-security-title" /><div className="mt-4"><ResponsiveTable
        rows={SECURITY_ROWS}
        rowKey={row => row.threat.en}
        label={t.security}
        minWidth={900}
        columns={[
          { id: 'threat', header: t.threat, heading: true, cellClassName: 'text-rose-700', cell: row => row.threat[language] },
          { id: 'impact', header: t.impact, cell: row => row.impact[language] },
          { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: row => row.defense[language] }
        ]}
      /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="automation-examples-title"><SectionTitle icon={GitBranch} title={t.examples} id="automation-examples-title" /><pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{AUTOMATION_EXAMPLES[language]}</code></pre></section>
    </div>
  );
}
