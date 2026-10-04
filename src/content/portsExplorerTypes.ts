import type { PortRegistryMetadata } from './portRegistry';

export interface PortContent {
  port: number | string;
  service: string;
  name: string;
  type: 'TCP' | 'UDP' | 'Both';
  range: 'well-known' | 'registered' | 'dynamic';
  description: { en: string; it: string };
  security: { en: string; it: string };
  isSecure: boolean;
}

export type PortInfo = PortContent & PortRegistryMetadata;

export interface ProtocolInfo {
  name: string;
  fullName: string;
  layer: number;
  type: string;
  description: { en: string; it: string };
  useCase: { en: string; it: string };
  security: { en: string; it: string };
  isSecure: boolean;
}

export interface DeviceInfo {
  name: string;
  fullName: string;
  layer: string;
  category: 'security' | 'networking' | 'infrastructure';
  role: { en: string; it: string };
  howItWorks: { en: string; it: string };
  securityAttacks: { en: string; it: string };
  cannotStop: { en: string; it: string };
  mitigation: { en: string; it: string };
  iconName: 'Shield' | 'Shuffle' | 'Network' | 'Activity' | 'Radio' | 'Cpu' | 'Server';
}
