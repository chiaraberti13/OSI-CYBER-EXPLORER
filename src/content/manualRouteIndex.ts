/**
 * Compact routing/navigation metadata derived from the full manual dataset.
 * Keep in sync with content/studyManual.ts; studyManual.test.ts asserts parity.
 */
import type { AppView } from '../store';

export interface ManualRouteEntry {
  id: string;
  title: { it: string; en: string };
  topicIds: readonly string[];
  labs: readonly AppView[];
}

export const MANUAL_ROUTE_INDEX: readonly ManualRouteEntry[] = [
  {
    id: 'osi-model',
    title: {
      it: 'Il modello OSI e l’incapsulamento',
      en: 'The OSI model and encapsulation'
    },
    topicIds: ['osi-why-layers', 'osi-seven-layers', 'osi-encapsulation', 'osi-vs-tcpip'],
    labs: ['osi', 'ports']
  },
  {
    id: 'ethernet-switching',
    title: {
      it: 'Ethernet, switching e tabella CAM',
      en: 'Ethernet, switching, and the CAM table'
    },
    topicIds: ['ethernet-frame-mac', 'switch-cam-learning', 'collision-broadcast-domains'],
    labs: ['fundamentals', 'access']
  },
  {
    id: 'ipv4-subnetting',
    title: {
      it: 'Indirizzamento IPv4 e subnetting',
      en: 'IPv4 addressing and subnetting'
    },
    topicIds: ['ipv4-address-mask', 'ipv4-subnet-math', 'ipv4-vlsm'],
    labs: ['fundamentals']
  },
  {
    id: 'vlan-trunk-stp',
    title: {
      it: 'VLAN, trunk 802.1Q e Spanning Tree',
      en: 'VLANs, 802.1Q trunks, and Spanning Tree'
    },
    topicIds: ['vlan-segmentation', 'trunk-dot1q', 'stp-loops'],
    labs: ['access']
  },
  {
    id: 'ip-routing-ospf',
    title: {
      it: 'Routing IP: rotte statiche e OSPF',
      en: 'IP routing: static routes and OSPF'
    },
    topicIds: ['routing-table-lpm', 'static-default-routes', 'ospf-basics'],
    labs: ['routing']
  },
  {
    id: 'ip-services',
    title: {
      it: 'Servizi IP: DHCP, DNS e NAT',
      en: 'IP services: DHCP, DNS, and NAT'
    },
    topicIds: ['dhcp-dora', 'dns-resolution', 'nat-pat', 'ip-services-ntp', 'ip-services-qos'],
    labs: ['services']
  },
  {
    id: 'security-fundamentals',
    title: {
      it: 'Fondamenti di sicurezza',
      en: 'Security fundamentals'
    },
    topicIds: ['cia-triad', 'threat-vuln-risk', 'defense-in-depth'],
    labs: ['defense']
  },
  {
    id: 'attacks-osi-killchain',
    title: {
      it: 'Attacchi per livello OSI e kill chain',
      en: 'Attacks by OSI layer and the kill chain'
    },
    topicIds: ['attacks-by-layer', 'cyber-kill-chain', 'multi-stage-attack-paths'],
    labs: ['attacklab', 'attackpaths']
  },
  {
    id: 'network-defenses',
    title: {
      it: 'Difese di rete: ACL, firewall, IDS/IPS e segmentazione',
      en: 'Network defenses: ACLs, firewalls, IDS/IPS and segmentation'
    },
    topicIds: ['acl-packet-filtering', 'firewalls-inspection', 'ids-ips-segmentation'],
    labs: ['securitycore', 'inspection', 'security']
  },
  {
    id: 'network-components',
    title: {
      it: 'Componenti, architetture e virtualizzazione',
      en: 'Network components, architectures, and virtualization'
    },
    topicIds: ['network-components-roles', 'network-architectures', 'network-virtualization'],
    labs: ['fundamentals']
  },
  {
    id: 'ipv6-addressing',
    title: {
      it: 'IPv6: indirizzamento, SLAAC e dual-stack',
      en: 'IPv6: addressing, SLAAC, and dual-stack'
    },
    topicIds: ['ipv6-format-types', 'ipv6-slaac-nd', 'ipv6-routing-dualstack'],
    labs: ['fundamentals', 'ipv6security']
  },
  {
    id: 'network-access-discovery',
    title: {
      it: 'Accesso alla rete: scoperta, EtherChannel e wireless',
      en: 'Network access: discovery, EtherChannel, and wireless'
    },
    topicIds: ['neighbor-discovery', 'etherchannel', 'wlan-ap-wlc', 'wlc-gui-policy-mapping'],
    labs: ['access', 'wirelesssecurity']
  },
  {
    id: 'ip-services-extended',
    title: {
      it: 'Servizi IP estesi e ridondanza del gateway',
      en: 'Extended IP services and gateway redundancy'
    },
    topicIds: ['fhrp-gateway-redundancy', 'management-ntp-snmp-syslog', 'qos-secure-access'],
    labs: ['routing', 'services']
  },
  {
    id: 'ccna-security-config',
    title: {
      it: 'Sicurezza CCNA: AAA, VPN e hardening di livello 2',
      en: 'CCNA security: AAA, VPN, and Layer 2 hardening'
    },
    topicIds: ['aaa-access-control', 'vpn-site-remote', 'layer2-wireless-hardening'],
    labs: ['securitycore']
  },
  {
    id: 'automation-programmability',
    title: {
      it: 'Automazione e programmabilità',
      en: 'Automation and programmability'
    },
    topicIds: ['automation-impact-sdn', 'rest-apis-json', 'config-management-tools'],
    labs: ['automation']
  },
  {
    id: 'crypto-vpn-pki-tls',
    title: {
      it: 'Crittografia, VPN/IPsec, PKI e TLS',
      en: 'Cryptography, VPN/IPsec, PKI, and TLS'
    },
    topicIds: ['crypto-building-blocks', 'ipsec-ikev2-depth', 'pki-tls-certificate-chain'],
    labs: ['vpnsecurity']
  },
  {
    id: 'identity-aaa-advanced',
    title: {
      it: 'Identità e AAA avanzati: 802.1X, EAP-TLS e NAC',
      en: 'Advanced identity and AAA: 802.1X, EAP-TLS, and NAC'
    },
    topicIds: ['dot1x-eap-tls', 'mab-fallback-order', 'dynamic-authorization-lifecycle'],
    labs: ['identitytrust']
  },
  {
    id: 'hardening-detection-ir',
    title: {
      it: 'Hardening, detection e incident response',
      en: 'Hardening, detection, and incident response'
    },
    topicIds: ['config-baseline-hardening', 'telemetry-detection', 'incident-response-evidence'],
    labs: ['hardening', 'detection', 'evidence']
  },
  {
    id: 'pentest-methodology',
    title: {
      it: 'Metodologia di penetration testing (eJPT)',
      en: 'Penetration testing methodology (eJPT)'
    },
    topicIds: [
      'pentest-engagement-phases',
      'pentest-recon-footprinting',
      'pentest-scanning-enumeration',
      'pentest-service-enumeration',
      'pentest-vulnerability-assessment',
      'pentest-password-attacks',
      'offline-hash-cracking-defense'
    ],
    labs: ['attackpaths', 'ports', 'scanstates', 'identitytrust']
  },
  {
    id: 'web-app-pentest',
    title: {
      it: 'Penetration testing delle applicazioni web (eJPT)',
      en: 'Web application penetration testing (eJPT)'
    },
    topicIds: [
      'web-http-proxy-mapping',
      'web-injection-classes',
      'web-auth-session-access',
      'web-file-inclusion-traversal'
    ],
    labs: ['applicationsecurity']
  },
  {
    id: 'exploitation-post-exploitation',
    title: {
      it: 'Exploitation e post-exploitation (eJPT)',
      en: 'Exploitation and post-exploitation (eJPT)'
    },
    topicIds: [
      'exploitation-concepts',
      'exploitation-frameworks-metasploit',
      'network-based-attacks',
      'post-exploitation-privesc',
      'lateral-movement-pivoting',
      'active-directory-basics',
      'exploitation-reverse-bind-shell'
    ],
    labs: ['attacklab', 'attackpaths', 'inspection']
  },
  {
    id: 'email-human-security',
    title: {
      it: 'Sicurezza dell’email e del fattore umano',
      en: 'Email and human-layer security'
    },
    topicIds: ['email-authentication-spf-dkim-dmarc', 'phishing-social-engineering', 'bec-consent-response'],
    labs: ['emailsecurity']
  },
  {
    id: 'endpoint-security-posture',
    title: {
      it: 'Sicurezza dell’endpoint e postura',
      en: 'Endpoint security and posture'
    },
    topicIds: [
      'endpoint-inventory-baseline-patching',
      'endpoint-edr-application-control',
      'endpoint-posture-isolation'
    ],
    labs: ['endpointsecurity']
  },
  {
    id: 'segmentation-trust-boundaries',
    title: {
      it: 'Segmentazione e confini di fiducia',
      en: 'Segmentation and trust boundaries'
    },
    topicIds: [
      'segmentation-separation-enforcement',
      'segmentation-microseg-zero-trust',
      'segmentation-overlay-shared-services'
    ],
    labs: ['segmentation']
  },
  {
    id: 'routing-control-plane-security',
    title: {
      it: 'Sicurezza del routing e del control plane',
      en: 'Routing and control-plane security'
    },
    topicIds: ['routing-trust-ospf-lsdb', 'routing-bgp-rpki-antispoofing', 'control-plane-copp-consistency'],
    labs: ['routingsecurity']
  },
  {
    id: 'availability-dos-capacity',
    title: {
      it: 'Disponibilità, DoS e capacità',
      en: 'Availability, DoS, and capacity'
    },
    topicIds: ['availability-resource-model', 'availability-state-floods', 'availability-capacity-queues'],
    labs: ['availability']
  },
  {
    id: 'management-plane-telemetry-security',
    title: {
      it: 'Sicurezza del piano di gestione e della telemetria',
      en: 'Management-plane and telemetry security'
    },
    topicIds: ['management-isolation-access', 'management-trusted-telemetry', 'management-automation-blind-spots'],
    labs: ['managementsecurity']
  },
  {
    id: 'resilience-recovery',
    title: {
      it: 'Resilienza e ripristino',
      en: 'Resilience and recovery'
    },
    topicIds: ['recovery-true-redundancy', 'recovery-procedure-continuity', 'recovery-validation-rto-rpo'],
    labs: ['recovery']
  },
  {
    id: 'access-layer-security',
    title: {
      it: 'Sicurezza dell’access layer: il confine della porta',
      en: 'Access-layer security: the port as the trust boundary'
    },
    topicIds: ['l2-port-trust-boundary', 'l2-first-hop-integrity', 'l2-topology-containment'],
    labs: ['layer2security']
  }
];

export function findManualRoute(chapterId: string): ManualRouteEntry | undefined {
  return MANUAL_ROUTE_INDEX.find((chapter) => chapter.id === chapterId);
}

export function manualChaptersForLab(lab: AppView): Pick<ManualRouteEntry, 'id' | 'title'>[] {
  return MANUAL_ROUTE_INDEX.filter((chapter) => chapter.labs.includes(lab));
}
