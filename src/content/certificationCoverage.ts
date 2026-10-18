/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import type { AppView } from '../store';
import type { Bilingual } from '../types';
import { CCNA_BLUEPRINT_TOPICS } from './ccnaBlueprint';

export type CoverageLevel = 'theory' | 'guided' | 'interactive';
export type CoverageStatus = 'covered' | 'partial';

export interface CertificationObjective {
  /** Official identifier, or a documented stable catalogue identifier when the source publishes none. */
  id: string;
  parentId?: string;
  title: Bilingual;
  verb: string;
  minimumLevel: CoverageLevel;
  coverageLevel: CoverageLevel;
  status: CoverageStatus;
  destinations: readonly AppView[];
  roadmapTask?: string;
}

export interface CertificationDomain {
  id: string;
  weight: number;
  title: Bilingual;
  objectives: readonly CertificationObjective[];
}

export const COVERAGE_LEVELS: readonly CoverageLevel[] = ['theory', 'guided', 'interactive'];

export const CERTIFICATION_SOURCES = {
  reviewedOn: '2026-10-18',
  ccna: {
    label: 'Cisco CCNA Exam v1.1 (200-301) exam topics',
    url: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf'
  },
  ejpt: {
    label: 'INE eJPT Certification domains and objectives',
    url: 'https://ine.com/security/certifications/ejpt-certification'
  }
} as const;

const OPERATIONAL_VERBS = new Set(['configure and verify', 'configure', 'verify', 'conduct', 'demonstrate', 'modify']);

export function minimumCoverageForVerb(verb: string): CoverageLevel {
  return [...OPERATIONAL_VERBS].some((candidate) => verb.toLowerCase().includes(candidate)) ? 'guided' : 'theory';
}

export function coverageMeetsMinimum(actual: CoverageLevel, minimum: CoverageLevel): boolean {
  return COVERAGE_LEVELS.indexOf(actual) >= COVERAGE_LEVELS.indexOf(minimum);
}

interface CcnaSubobjective {
  id: string;
  title: Bilingual;
  coverageLevel?: CoverageLevel;
  status?: CoverageStatus;
  roadmapTask?: string;
}

const sub = (
  id: string,
  it: string,
  en: string,
  override: Pick<CcnaSubobjective, 'coverageLevel' | 'status' | 'roadmapTask'> = {}
): CcnaSubobjective => ({ id, title: { it, en }, ...override });

/** Exact Cisco v1.1 child identifiers; parents without children remain leaf objectives. */
const CCNA_SUBOBJECTIVES: Readonly<Record<string, readonly CcnaSubobjective[]>> = {
  '1.1': [
    sub('1.1.a', 'Router', 'Routers'),
    sub('1.1.b', 'Switch Layer 2 e Layer 3', 'Layer 2 and Layer 3 switches'),
    sub('1.1.c', 'Firewall next-generation e IPS', 'Next-generation firewalls and IPS'),
    sub('1.1.d', 'Access point', 'Access points'),
    sub('1.1.e', 'Controller', 'Controllers'),
    sub('1.1.f', 'Endpoint', 'Endpoints'),
    sub('1.1.g', 'Server', 'Servers'),
    sub('1.1.h', 'Power over Ethernet (PoE)', 'Power over Ethernet (PoE)')
  ],
  '1.2': [
    sub('1.2.a', 'Architettura a due livelli', 'Two-tier'),
    sub('1.2.b', 'Architettura a tre livelli', 'Three-tier'),
    sub('1.2.c', 'Architettura spine-leaf', 'Spine-leaf'),
    sub('1.2.d', 'WAN', 'WAN'),
    sub('1.2.e', 'Piccolo ufficio/home office (SOHO)', 'Small office/home office (SOHO)'),
    sub('1.2.f', 'On-premises e cloud', 'On-premises and cloud')
  ],
  '1.3': [
    sub('1.3.a', 'Fibra monomodale, multimodale e rame', 'Single-mode fiber, multimode fiber, copper'),
    sub('1.3.b', 'Ethernet condiviso e point-to-point', 'Ethernet shared media and point-to-point')
  ],
  '1.9': [
    sub('1.9.a', 'Unicast globale, unique-local e link-local', 'Unicast: global, unique local, and link local'),
    sub('1.9.b', 'Anycast', 'Anycast'),
    sub('1.9.c', 'Multicast', 'Multicast'),
    sub('1.9.d', 'EUI-64 modificato', 'Modified EUI-64')
  ],
  '1.11': [
    sub('1.11.a', 'Canali Wi-Fi non sovrapposti', 'Nonoverlapping Wi-Fi channels'),
    sub('1.11.b', 'SSID', 'SSID'),
    sub('1.11.c', 'Radiofrequenza', 'RF'),
    sub('1.11.d', 'Cifratura', 'Encryption')
  ],
  '1.13': [
    sub('1.13.a', 'Apprendimento e aging MAC', 'MAC learning and aging'),
    sub('1.13.b', 'Commutazione dei frame', 'Frame switching'),
    sub('1.13.c', 'Flooding dei frame', 'Frame flooding'),
    sub('1.13.d', 'Tabella degli indirizzi MAC', 'MAC address table')
  ],
  '2.1': [
    sub('2.1.a', 'Porte access dati e voce', 'Access ports: data and voice'),
    sub('2.1.b', 'VLAN predefinita', 'Default VLAN'),
    sub('2.1.c', 'Connettività inter-VLAN', 'InterVLAN connectivity')
  ],
  '2.2': [
    sub('2.2.a', 'Porte trunk', 'Trunk ports'),
    sub('2.2.b', 'IEEE 802.1Q', 'IEEE 802.1Q'),
    sub('2.2.c', 'VLAN nativa', 'Native VLAN')
  ],
  '2.5': [
    sub(
      '2.5.a',
      'Root port, root bridge primario/secondario e altri nomi delle porte',
      'Root port, primary/secondary root bridge, and other port names'
    ),
    sub('2.5.b', 'Stati e ruoli delle porte', 'Port states and roles'),
    sub('2.5.c', 'PortFast', 'PortFast'),
    sub(
      '2.5.d',
      'Root Guard, Loop Guard, BPDU Filter e BPDU Guard',
      'Root Guard, Loop Guard, BPDU Filter, and BPDU Guard',
      {
        status: 'partial',
        roadmapTask: 'CCNA-06'
      }
    )
  ],
  '3.1': [
    sub('3.1.a', 'Codice del protocollo di routing', 'Routing protocol code'),
    sub('3.1.b', 'Prefisso', 'Prefix'),
    sub('3.1.c', 'Maschera di rete', 'Network mask'),
    sub('3.1.d', 'Next hop', 'Next hop'),
    sub('3.1.e', 'Distanza amministrativa', 'Administrative distance'),
    sub('3.1.f', 'Metrica', 'Metric'),
    sub('3.1.g', 'Gateway di ultima istanza', 'Gateway of last resort')
  ],
  '3.2': [
    sub('3.2.a', 'Longest prefix match', 'Longest prefix match'),
    sub('3.2.b', 'Distanza amministrativa', 'Administrative distance'),
    sub('3.2.c', 'Metrica del protocollo di routing', 'Routing protocol metric')
  ],
  '3.3': [
    sub('3.3.a', 'Rotta predefinita', 'Default route'),
    sub('3.3.b', 'Rotta di rete', 'Network route'),
    sub('3.3.c', 'Rotta host', 'Host route'),
    sub('3.3.d', 'Rotta statica floating', 'Floating static route')
  ],
  '3.4': [
    sub('3.4.a', 'Adiacenze tra neighbor', 'Neighbor adjacencies'),
    sub('3.4.b', 'Point-to-point', 'Point-to-point'),
    sub('3.4.c', 'Broadcast e selezione DR/BDR', 'Broadcast and DR/BDR selection'),
    sub('3.4.d', 'Router ID', 'Router ID')
  ],
  '6.3': [
    sub('6.3.a', 'Separazione del control plane e del data plane', 'Separation of control plane and data plane'),
    sub('6.3.b', 'API northbound e southbound', 'Northbound and southbound APIs')
  ]
};

const CCNA_VERBS: Readonly<Record<string, string>> = {
  '1.1': 'explain',
  '1.2': 'describe',
  '1.3': 'compare',
  '1.4': 'identify',
  '1.5': 'compare',
  '1.6': 'configure and verify',
  '1.7': 'describe',
  '1.8': 'configure and verify',
  '1.9': 'describe',
  '1.10': 'verify',
  '1.11': 'describe',
  '1.12': 'explain',
  '1.13': 'describe',
  '2.1': 'configure and verify',
  '2.2': 'configure and verify',
  '2.3': 'configure and verify',
  '2.4': 'configure and verify',
  '2.5': 'interpret',
  '2.6': 'describe',
  '2.7': 'describe',
  '2.8': 'describe',
  '2.9': 'interpret',
  '3.1': 'interpret',
  '3.2': 'determine',
  '3.3': 'configure and verify',
  '3.4': 'configure and verify',
  '3.5': 'describe',
  '4.1': 'configure and verify',
  '4.2': 'configure and verify',
  '4.3': 'explain',
  '4.4': 'explain',
  '4.5': 'describe',
  '4.6': 'configure and verify',
  '4.7': 'explain',
  '4.8': 'configure',
  '4.9': 'describe',
  '5.1': 'define',
  '5.2': 'describe',
  '5.3': 'configure and verify',
  '5.4': 'describe',
  '5.5': 'describe',
  '5.6': 'configure and verify',
  '5.7': 'configure and verify',
  '5.8': 'compare',
  '5.9': 'describe',
  '5.10': 'configure and verify',
  '6.1': 'explain',
  '6.2': 'compare',
  '6.3': 'describe',
  '6.4': 'explain',
  '6.5': 'describe',
  '6.6': 'recognize',
  '6.7': 'recognize'
};

const CCNA_PARTIAL: Readonly<Record<string, string>> = {};

const practicalCcnaLevel = (id: string, verb: string): CoverageLevel => {
  if (['2.5', '3.3', '4.1', '4.2'].includes(id)) return 'guided';
  return minimumCoverageForVerb(verb) === 'guided' ? 'interactive' : 'theory';
};

export const CCNA_COVERAGE_OBJECTIVES: readonly CertificationObjective[] = CCNA_BLUEPRINT_TOPICS.flatMap((parent) => {
  const verb = CCNA_VERBS[parent.id];
  const roadmapTask = CCNA_PARTIAL[parent.id];
  const coverageLevel = practicalCcnaLevel(parent.id, verb);
  const parentObjective: CertificationObjective = {
    id: parent.id,
    title: parent.title,
    verb,
    minimumLevel: minimumCoverageForVerb(verb),
    coverageLevel,
    status: roadmapTask ? 'partial' : 'covered',
    destinations: parent.destinations,
    ...(roadmapTask ? { roadmapTask } : {})
  };
  const children = (CCNA_SUBOBJECTIVES[parent.id] ?? []).map<CertificationObjective>((child) => ({
    id: child.id,
    parentId: parent.id,
    title: child.title,
    verb,
    minimumLevel: minimumCoverageForVerb(verb),
    coverageLevel: child.id === '2.5.d' ? 'guided' : (child.coverageLevel ?? coverageLevel),
    status: child.id === '2.5.d' ? 'covered' : (child.status ?? 'covered'),
    destinations: parent.destinations,
    ...(child.id === '2.5.d' ? {} : child.roadmapTask ? { roadmapTask: child.roadmapTask } : {})
  }));
  return [parentObjective, ...children];
});

interface EjptInput {
  id: string;
  it: string;
  en: string;
  verb: string;
  level: CoverageLevel;
  destinations: readonly AppView[];
  roadmapTask?: string;
}

const ejpt = ({ id, it, en, verb, level, destinations, roadmapTask }: EjptInput): CertificationObjective => ({
  id,
  title: { it, en },
  verb,
  minimumLevel: minimumCoverageForVerb(verb),
  coverageLevel: level,
  status: roadmapTask ? 'partial' : 'covered',
  destinations,
  ...(roadmapTask ? { roadmapTask } : {})
});

/** INE publishes ordered objectives but no objective codes; these stable IDs preserve that published order. */
export const EJPT_COVERAGE_DOMAINS: readonly CertificationDomain[] = [
  {
    id: 'ejpt-hnpt',
    weight: 35,
    title: { it: 'Penetration test di host e reti', en: 'Host and Network Penetration Testing' },
    objectives: [
      ejpt({
        id: 'EJPT-HNPT-01',
        it: 'Identificare e modificare exploit',
        en: 'Identify and modify exploits',
        verb: 'identify and modify',
        level: 'interactive',
        destinations: ['exploitlab']
      }),
      ejpt({
        id: 'EJPT-HNPT-02',
        it: 'Condurre exploitation con Metasploit',
        en: 'Conduct exploitation with Metasploit',
        verb: 'conduct',
        level: 'interactive',
        destinations: ['exploitlab']
      }),
      ejpt({
        id: 'EJPT-HNPT-03',
        it: 'Dimostrare pivoting aggiungendo una route e tramite port forwarding',
        en: 'Demonstrate pivoting by adding a route and by port forwarding',
        verb: 'demonstrate',
        level: 'interactive',
        destinations: ['pivotlab']
      }),
      ejpt({
        id: 'EJPT-HNPT-04',
        it: 'Condurre attacchi brute force alle password e cracking di hash',
        en: 'Conduct brute-force password attacks and hash cracking',
        verb: 'conduct',
        level: 'interactive',
        destinations: ['passwordlab']
      })
    ]
  },
  {
    id: 'ejpt-assessment',
    weight: 25,
    title: { it: 'Metodologie di assessment', en: 'Assessment Methodologies' },
    objectives: [
      ejpt({
        id: 'EJPT-AM-01',
        it: 'Localizzare endpoint in una rete',
        en: 'Locate endpoints on a network',
        verb: 'locate',
        level: 'guided',
        destinations: ['scanstates', 'assessment']
      }),
      ejpt({
        id: 'EJPT-AM-02',
        it: 'Identificare porte aperte e servizi su un target',
        en: 'Identify open ports and services on a target',
        verb: 'identify',
        level: 'interactive',
        destinations: ['scanstates', 'ports', 'assessment']
      }),
      ejpt({
        id: 'EJPT-AM-03',
        it: 'Identificare il sistema operativo di un target',
        en: 'Identify the operating system of a target',
        verb: 'identify',
        level: 'guided',
        destinations: ['scanstates', 'assessment']
      }),
      ejpt({
        id: 'EJPT-AM-04',
        it: 'Estrarre informazioni aziendali da fonti pubbliche',
        en: 'Extract company information from public sources',
        verb: 'extract',
        level: 'guided',
        destinations: ['assessment']
      }),
      ejpt({
        id: 'EJPT-AM-05',
        it: 'Raccogliere indirizzi email da fonti pubbliche',
        en: 'Gather email addresses from public sources',
        verb: 'gather',
        level: 'guided',
        destinations: ['assessment']
      }),
      ejpt({
        id: 'EJPT-AM-06',
        it: 'Raccogliere informazioni tecniche da fonti pubbliche',
        en: 'Gather technical information from public sources',
        verb: 'gather',
        level: 'guided',
        destinations: ['assessment']
      }),
      ejpt({
        id: 'EJPT-AM-07',
        it: 'Identificare vulnerabilità nei servizi',
        en: 'Identify vulnerabilities in services',
        verb: 'identify',
        level: 'guided',
        destinations: ['attacklab', 'assessment']
      }),
      ejpt({
        id: 'EJPT-AM-08',
        it: 'Valutare informazioni, criticità o impatto delle vulnerabilità',
        en: 'Evaluate information and criticality or impact of vulnerabilities',
        verb: 'evaluate',
        level: 'guided',
        destinations: ['assessment']
      })
    ]
  },
  {
    id: 'ejpt-auditing',
    weight: 25,
    title: { it: 'Audit di host e reti', en: 'Host and Networking Auditing' },
    objectives: [
      ejpt({
        id: 'EJPT-HNA-01',
        it: 'Compilare informazioni dai file sul target',
        en: 'Compile information from files on target',
        verb: 'compile',
        level: 'interactive',
        destinations: ['auditlab', 'hardening']
      }),
      ejpt({
        id: 'EJPT-HNA-02',
        it: 'Enumerare informazioni di rete dai file sul target',
        en: 'Enumerate network information from files on target',
        verb: 'enumerate',
        level: 'interactive',
        destinations: ['auditlab', 'hardening']
      }),
      ejpt({
        id: 'EJPT-HNA-03',
        it: 'Enumerare informazioni di sistema sul target',
        en: 'Enumerate system information on target',
        verb: 'enumerate',
        level: 'interactive',
        destinations: ['auditlab', 'hardening']
      }),
      ejpt({
        id: 'EJPT-HNA-04',
        it: 'Raccogliere informazioni sugli account utente del target',
        en: 'Gather user account information on target',
        verb: 'gather',
        level: 'interactive',
        destinations: ['auditlab', 'identitytrust']
      }),
      ejpt({
        id: 'EJPT-HNA-05',
        it: 'Trasferire file da e verso il target',
        en: 'Transfer files to and from target',
        verb: 'transfer',
        level: 'interactive',
        destinations: ['auditlab', 'hardening']
      }),
      ejpt({
        id: 'EJPT-HNA-06',
        it: 'Raccogliere hash o password dal target',
        en: 'Gather hash/password information from target',
        verb: 'gather',
        level: 'interactive',
        destinations: ['auditlab', 'identitytrust']
      })
    ]
  },
  {
    id: 'ejpt-web',
    weight: 15,
    title: { it: 'Penetration test di applicazioni web', en: 'Web Application Penetration Testing' },
    objectives: [
      ejpt({
        id: 'EJPT-WAPT-01',
        it: 'Identificare vulnerabilità nelle applicazioni web',
        en: 'Identify vulnerabilities in web applications',
        verb: 'identify',
        level: 'interactive',
        destinations: ['weblab', 'applicationsecurity']
      }),
      ejpt({
        id: 'EJPT-WAPT-02',
        it: 'Localizzare file e directory nascosti',
        en: 'Locate hidden files and directories',
        verb: 'locate',
        level: 'interactive',
        destinations: ['weblab', 'applicationsecurity']
      }),
      ejpt({
        id: 'EJPT-WAPT-03',
        it: 'Condurre un attacco brute force al login',
        en: 'Conduct a brute-force login attack',
        verb: 'conduct',
        level: 'interactive',
        destinations: ['weblab', 'applicationsecurity']
      }),
      ejpt({
        id: 'EJPT-WAPT-04',
        it: 'Condurre ricognizione di un’applicazione web',
        en: 'Conduct web application reconnaissance',
        verb: 'conduct',
        level: 'interactive',
        destinations: ['weblab', 'applicationsecurity']
      })
    ]
  }
];

export const EJPT_COVERAGE_OBJECTIVES = EJPT_COVERAGE_DOMAINS.flatMap((domain) => domain.objectives);
export const CERTIFICATION_COVERAGE_OBJECTIVES = [...CCNA_COVERAGE_OBJECTIVES, ...EJPT_COVERAGE_OBJECTIVES];
