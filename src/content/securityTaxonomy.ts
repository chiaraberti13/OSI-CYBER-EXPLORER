import type { Bilingual } from '../types';

export type SecurityPlane = 'physical' | 'data' | 'control' | 'management' | 'application' | 'identity';

export interface AttackFamily {
  id: string;
  name: Bilingual;
  description: Bilingual;
  planes: SecurityPlane[];
}

export const ATTACK_FAMILIES: AttackFamily[] = [
  { id: 'reconnaissance', name: { it: 'Ricognizione ed enumerazione', en: 'Reconnaissance and enumeration' }, description: { it: 'Raccolta di informazioni su host, porte, servizi, topologie e identità.', en: 'Collection of information about hosts, ports, services, topologies, and identities.' }, planes: ['data', 'management', 'application'] },
  { id: 'spoofing', name: { it: 'Spoofing e impersonificazione', en: 'Spoofing and impersonation' }, description: { it: 'Falsificazione di identità, indirizzi, risposte o annunci di rete.', en: 'Forgery of identities, addresses, replies, or network advertisements.' }, planes: ['data', 'control', 'identity'] },
  { id: 'mitm', name: { it: 'Intercettazione e man-in-the-middle', en: 'Eavesdropping and man-in-the-middle' }, description: { it: 'Osservazione o modifica del traffico tra due soggetti.', en: 'Observation or modification of traffic between two parties.' }, planes: ['physical', 'data', 'application'] },
  { id: 'availability', name: { it: 'DoS, DDoS ed esaurimento risorse', en: 'DoS, DDoS, and resource exhaustion' }, description: { it: 'Riduzione o interruzione della disponibilità di collegamenti, dispositivi o servizi.', en: 'Degradation or interruption of links, devices, or services.' }, planes: ['physical', 'data', 'control', 'application'] },
  { id: 'routing', name: { it: 'Manipolazione del routing', en: 'Routing manipulation' }, description: { it: 'Alterazione di rotte, metriche, adiacenze o annunci di raggiungibilità.', en: 'Manipulation of routes, metrics, adjacencies, or reachability advertisements.' }, planes: ['control', 'data'] },
  { id: 'session', name: { it: 'Replay e dirottamento di sessione', en: 'Replay and session hijacking' }, description: { it: 'Riutilizzo o sottrazione di messaggi, token e stato di sessione.', en: 'Reuse or takeover of messages, tokens, and session state.' }, planes: ['data', 'application', 'identity'] },
  { id: 'credentials', name: { it: 'Attacchi alle credenziali', en: 'Credential attacks' }, description: { it: 'Brute force, password spraying, furto e riutilizzo delle credenziali.', en: 'Brute force, password spraying, credential theft, and credential reuse.' }, planes: ['management', 'application', 'identity'] },
  { id: 'injection', name: { it: 'Injection e input malevolo', en: 'Injection and malicious input' }, description: { it: 'Dati costruiti per alterare l’interpretazione di applicazioni, parser o API.', en: 'Crafted data that changes how applications, parsers, or APIs interpret input.' }, planes: ['application', 'management'] },
  { id: 'wireless', name: { it: 'Attacchi wireless', en: 'Wireless attacks' }, description: { it: 'Jamming, rogue AP, evil twin, deauthentication e compromissione dell’accesso radio.', en: 'Jamming, rogue APs, evil twins, deauthentication, and radio-access compromise.' }, planes: ['physical', 'data', 'identity'] },
  { id: 'automation', name: { it: 'Attacchi ad automazione e API', en: 'Automation and API attacks' }, description: { it: 'Abuso di API, token, segreti, controller, pipeline e Infrastructure as Code.', en: 'Abuse of APIs, tokens, secrets, controllers, pipelines, and Infrastructure as Code.' }, planes: ['management', 'application', 'identity'] }
];
