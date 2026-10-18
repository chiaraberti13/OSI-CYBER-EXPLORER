import type { Bilingual } from '../types';

export type AuditPlatform = 'linux' | 'windows';
export type AuditCategory = 'network' | 'system' | 'accounts' | 'sensitive-metadata';
export type AuditTransferDirection = 'host-to-analyst' | 'analyst-to-host';

export interface AuditEvidence {
  id: string;
  category: AuditCategory;
  sourcePath: string;
  summary: Bilingual;
  sensitivity: 'low' | 'moderate' | 'high';
  redacted: boolean;
  sha256: string;
}

export interface AuditCustodyEvent {
  sequence: number;
  action: 'collect' | 'transfer';
  timestamp: string;
  actor: string;
  from: string;
  to: string;
  artifactId: string;
  sha256: string;
  result: Bilingual;
}

export interface AuditSession {
  platform: AuditPlatform;
  active: boolean;
  evidence: AuditEvidence[];
  custody: AuditCustodyEvent[];
  transfer: { direction: AuditTransferDirection; fileName: string; sha256: string; verified: boolean } | null;
}

export const AUDIT_COPY = {
  it: {
    eyebrow: 'eJPT · AUDIT DI HOST E RETE · GESTIONE DELLE EVIDENZE',
    title: 'Audit di host e rete: raccolta evidenze',
    intro:
      'Raccogli solo elementi autorizzati, minimizza i dati sensibili e registra integrità, origine e passaggi di custodia con fixture locali.',
    scopeTitle: 'Scope e autorizzazione',
    sensitiveTitle: 'Dati sensibili e limiti',
    linux: 'Host Linux sintetico',
    windows: 'Host Windows sintetico',
    scope: 'Scope didattico: fixture host autorizzato 192.0.2.44; non sono coinvolti sistemi reali.',
    noSecrets:
      'Minimizzazione: password e hash non vengono letti o conservati. Si registra solo la presenza di materiale sensibile, con valore redatto.',
    integrity:
      'SHA-256 verifica che il contenuto fixture non cambi; da solo non prova autenticità, autorizzazione o riservatezza. In un incarico reale servono canale cifrato autenticato, accesso minimo e catena di custodia concordata.',
    collect: 'Raccogli evidenze selezionate',
    collectHelp: 'Seleziona solo le categorie necessarie e conferma lo scope.',
    network: 'Stato rete: interfacce, route, ARP e listener',
    system: 'Stato sistema: versione e configurazione base',
    accounts: 'Inventario account sintetici e privilegi',
    sensitive: 'Metadati credenziali (solo conteggio, valore redatto)',
    evidence: 'Manifest di evidenze minimizzate',
    custody: 'Catena di custodia',
    direction: 'Direzione del trasferimento simulato',
    toAnalyst: 'Host → analista (raccolta fixture)',
    toHost: 'Analista → host (nota inerte fixture)',
    transfer: 'Simula trasferimento autorizzato',
    transferred: 'Trasferimento fixture verificato con SHA-256.',
    noEvidence: 'Raccogli almeno una categoria prima del trasferimento host → analista.',
    allowlist: 'Allowlist: solo artefatti inventariati; nessun percorso arbitrario o file eseguibile.',
    report: 'Report bilingue minimizzato',
    cleanup: 'Pulisci sessione',
    cleaned: 'Sessione pulita: evidenze, trasferimento e catena di custodia rimossi dalla vista.',
    notStarted: 'Conferma lo scope per abilitare raccolta e trasferimento.',
    error: 'Impossibile calcolare l’integrità fixture in questo contesto sicuro.',
    yes: 'Sì · valore redatto',
    no: 'No',
    source: 'Origine',
    sensitivity: 'Sensibilità',
    digest: 'SHA-256 fixture',
    collected: 'Raccolto',
    action: 'Operazione',
    actor: 'Operatore',
    from: 'Da',
    to: 'A',
    verified: 'Verificato',
    timestamp: '2026-10-18 12:00 UTC · timestamp fixture',
    noNetwork:
      'Tutte le azioni restano nello stato locale della vista: nessun comando, file reale, sistema, socket o richiesta di rete viene usato.',
    inputLabel: 'Confermo autorizzazione e uso esclusivo delle fixture; nessun segreto reale.'
  },
  en: {
    eyebrow: 'eJPT · HOST & NETWORK AUDITING · EVIDENCE HANDLING',
    title: 'Host and network audit: evidence collection',
    intro:
      'Collect authorized items only, minimize sensitive data, and record integrity, source, and custody events using local fixtures.',
    scopeTitle: 'Scope and authorization',
    sensitiveTitle: 'Sensitive data and limits',
    linux: 'Synthetic Linux host',
    windows: 'Synthetic Windows host',
    scope: 'Teaching scope: authorized fixture host 192.0.2.44; no real systems are involved.',
    noSecrets:
      'Minimization: passwords and hashes are never read or retained. Only the presence of sensitive material is recorded, with its value redacted.',
    integrity:
      'SHA-256 checks that fixture content has not changed; by itself it proves no authenticity, authorization, or confidentiality. A real engagement needs an authenticated encrypted channel, least access, and an agreed chain of custody.',
    collect: 'Collect selected evidence',
    collectHelp: 'Select only necessary categories and confirm scope.',
    network: 'Network state: interfaces, routes, ARP, and listeners',
    system: 'System state: version and baseline configuration',
    accounts: 'Synthetic account and privilege inventory',
    sensitive: 'Credential metadata (count only, value redacted)',
    evidence: 'Minimized evidence manifest',
    custody: 'Chain of custody',
    direction: 'Simulated transfer direction',
    toAnalyst: 'Host → analyst (fixture collection)',
    toHost: 'Analyst → host (inert fixture note)',
    transfer: 'Simulate authorized transfer',
    transferred: 'Fixture transfer verified with SHA-256.',
    noEvidence: 'Collect at least one category before host → analyst transfer.',
    allowlist: 'Allowlist: inventoried artifacts only; no arbitrary paths or executable files.',
    report: 'Minimized bilingual report',
    cleanup: 'Clear session',
    cleaned: 'Session cleared: evidence, transfer, and custody chain removed from the view.',
    notStarted: 'Confirm scope to enable collection and transfer.',
    error: 'Could not calculate fixture integrity in this secure context.',
    yes: 'Yes · value redacted',
    no: 'No',
    source: 'Source',
    sensitivity: 'Sensitivity',
    digest: 'Fixture SHA-256',
    collected: 'Collected',
    action: 'Action',
    actor: 'Operator',
    from: 'From',
    to: 'To',
    verified: 'Verified',
    timestamp: '2026-10-18 12:00 UTC · fixture timestamp',
    noNetwork:
      'All actions stay in local view state: no command, real file, system, socket, or network request is used.',
    inputLabel: 'I confirm authorization and use of fixtures only; no real secrets.'
  }
} as const satisfies Record<AuditPlatform extends never ? never : 'it' | 'en', Record<string, string>>;

const CATEGORY_META: Record<AuditCategory, { sensitivity: AuditEvidence['sensitivity']; redacted: boolean }> = {
  network: { sensitivity: 'low', redacted: false },
  system: { sensitivity: 'moderate', redacted: false },
  accounts: { sensitivity: 'high', redacted: true },
  'sensitive-metadata': { sensitivity: 'high', redacted: true }
};

const FIXTURE_RECORDS: Record<
  AuditPlatform,
  Record<AuditCategory, { path: string; id: string; it: string; en: string }>
> = {
  linux: {
    network: {
      path: '/fixture/net-state.json',
      id: 'linux-network',
      it: 'ens33 192.0.2.44/24 · route default via 192.0.2.1 · listener TCP/22, TCP/443 · ARP gateway fixture',
      en: 'ens33 192.0.2.44/24 · default route via 192.0.2.1 · TCP/22 and TCP/443 listeners · fixture gateway ARP'
    },
    system: {
      path: '/fixture/os-release.json',
      id: 'linux-system',
      it: 'Linux fixture 6.x · baseline packages current · SSH password authentication disabled',
      en: 'Linux fixture 6.x · baseline packages current · SSH password authentication disabled'
    },
    accounts: {
      path: '/fixture/passwd-summary.json',
      id: 'linux-accounts',
      it: 'Account fixture: analyst (sudo), websvc (service); UID e gruppi sintetici, nessun token o segreto.',
      en: 'Fixture accounts: analyst (sudo), websvc (service); synthetic UIDs and groups, no token or secret.'
    },
    'sensitive-metadata': {
      path: '/fixture/shadow-metadata.json',
      id: 'linux-secret-metadata',
      it: 'Archivio credenziali presente: 2 record sintetici; password/hash omessi e non acquisiti.',
      en: 'Credential store present: 2 synthetic records; passwords/hashes omitted and not collected.'
    }
  },
  windows: {
    network: {
      path: 'C:\\Fixture\\net-state.json',
      id: 'windows-network',
      it: 'Ethernet0 198.51.100.44/24 · route default via 198.51.100.1 · listener TCP/445, TCP/3389 · ARP gateway fixture',
      en: 'Ethernet0 198.51.100.44/24 · default route via 198.51.100.1 · TCP/445 and TCP/3389 listeners · fixture gateway ARP'
    },
    system: {
      path: 'C:\\Fixture\\system-summary.json',
      id: 'windows-system',
      it: 'Windows fixture 11 · firewall attivo · SMBv1 disabilitato · aggiornamenti fixture correnti',
      en: 'Windows fixture 11 · firewall enabled · SMBv1 disabled · fixture updates current'
    },
    accounts: {
      path: 'C:\\Fixture\\local-users-summary.json',
      id: 'windows-accounts',
      it: 'Account fixture: audituser (Users), svc-web (service); SID sintetici, nessun token o segreto.',
      en: 'Fixture accounts: audituser (Users), svc-web (service); synthetic SIDs, no token or secret.'
    },
    'sensitive-metadata': {
      path: 'C:\\Fixture\\credential-store-metadata.json',
      id: 'windows-secret-metadata',
      it: 'Archivio credenziali presente: 2 record sintetici; password/hash omessi e non acquisiti.',
      en: 'Credential store present: 2 synthetic records; passwords/hashes omitted and not collected.'
    }
  }
};

export async function sha256Fixture(value: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('Web Crypto SHA-256 is unavailable');
  const bytes = new TextEncoder().encode(value);
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createEmptyAuditSession(platform: AuditPlatform): AuditSession {
  return { platform, active: true, evidence: [], custody: [], transfer: null };
}

export async function collectAuditEvidence(
  platform: AuditPlatform,
  categories: readonly AuditCategory[],
  authorized: boolean
): Promise<AuditSession | null> {
  if (!authorized || categories.length === 0 || categories.some((category) => !Object.hasOwn(CATEGORY_META, category)))
    return null;
  const uniqueCategories = [...new Set(categories)];
  const evidence = await Promise.all(
    uniqueCategories.map(async (category): Promise<AuditEvidence> => {
      const fixture = FIXTURE_RECORDS[platform][category];
      const summary = { it: fixture.it, en: fixture.en };
      const payload = JSON.stringify({ platform, sourcePath: fixture.path, ...summary });
      return {
        id: fixture.id,
        category,
        sourcePath: fixture.path,
        summary,
        sensitivity: CATEGORY_META[category].sensitivity,
        redacted: CATEGORY_META[category].redacted,
        sha256: await sha256Fixture(payload)
      };
    })
  );
  const custody = await Promise.all(
    evidence.map(async (item, index): Promise<AuditCustodyEvent> => {
      const event = {
        sequence: index + 1,
        action: 'collect' as const,
        timestamp: '2026-10-18T12:00:00Z',
        actor: 'authorized-auditor-fixture',
        from: 'synthetic-host',
        to: 'local-evidence-vault',
        artifactId: item.id,
        sha256: item.sha256
      };
      return {
        ...event,
        result: {
          it: `Raccolta minimizzata; integrità fixture registrata ${await sha256Fixture(JSON.stringify(event))}.`,
          en: `Minimized collection; fixture integrity recorded ${await sha256Fixture(JSON.stringify(event))}.`
        }
      };
    })
  );
  return { platform, active: true, evidence, custody, transfer: null };
}

export async function simulateAuditTransfer(
  session: AuditSession,
  direction: AuditTransferDirection,
  authorized: boolean
): Promise<AuditSession | null> {
  if (!authorized || !session.active) return null;
  if (direction === 'host-to-analyst' && session.evidence.length === 0) return null;
  const artifactId = direction === 'host-to-analyst' ? session.evidence[0].id : 'inert-validation-note';
  const fileName = direction === 'host-to-analyst' ? `${artifactId}.redacted.json` : 'validation-note.txt';
  const payload =
    direction === 'host-to-analyst'
      ? JSON.stringify(
          session.evidence.map(({ id, category, sourcePath, summary, sensitivity, redacted, sha256 }) => ({
            id,
            category,
            sourcePath,
            summary,
            sensitivity,
            redacted,
            sha256
          }))
        )
      : 'Synthetic, inert validation note. No command, script, credential, or executable content.';
  const digest = await sha256Fixture(payload);
  const receivedDigest = await sha256Fixture(payload);
  if (digest !== receivedDigest) return null;
  const eventCore = {
    sequence: session.custody.length + 1,
    action: 'transfer' as const,
    timestamp: '2026-10-18T12:00:00Z',
    actor: 'authorized-auditor-fixture',
    from: direction === 'host-to-analyst' ? 'synthetic-host' : 'analyst-fixture',
    to: direction === 'host-to-analyst' ? 'analyst-fixture' : 'synthetic-host',
    artifactId,
    sha256: digest
  };
  const event: AuditCustodyEvent = {
    ...eventCore,
    result: {
      it: `Trasferimento consentito da allowlist; digest ricevuto verificato ${digest}.`,
      en: `Allowlisted transfer permitted; received digest verified ${digest}.`
    }
  };
  return {
    ...session,
    custody: [...session.custody, event],
    transfer: { direction, fileName, sha256: digest, verified: true }
  };
}

export function cleanupAuditSession(session: AuditSession): AuditSession {
  return { platform: session.platform, active: false, evidence: [], custody: [], transfer: null };
}
