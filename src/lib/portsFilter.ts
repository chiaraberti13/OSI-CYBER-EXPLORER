import type { DeviceInfo, PortInfo, ProtocolInfo } from '../content/portsExplorerTypes';

export type Language = 'en' | 'it';
export type PortRangeFilter = 'all' | 'well-known' | 'registered' | 'dynamic';
export type DeviceCategoryFilter = 'all' | 'security' | 'networking' | 'infrastructure';

export function filterPorts(
  registry: readonly PortInfo[],
  range: PortRangeFilter,
  searchTerm: string,
  language: Language
): PortInfo[] {
  const term = searchTerm.toLowerCase();
  return registry.filter(p => {
    const rangeMatch = range === 'all' || p.range === range;
    const searchMatch = !searchTerm ||
      p.ports.join(' / ').includes(term) ||
      p.transports.join(' ').toLowerCase().includes(term) ||
      p.registrationStatus.includes(term) ||
      p.ianaServiceNames.some(name => name.includes(term)) ||
      p.encryptedEquivalent?.service.toLowerCase().includes(term) ||
      p.service.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.description[language].toLowerCase().includes(term);
    return rangeMatch && searchMatch;
  });
}

export function filterProtocols(
  registry: readonly ProtocolInfo[],
  searchTerm: string,
  language: Language
): ProtocolInfo[] {
  const term = searchTerm.toLowerCase();
  return registry.filter(p =>
    !searchTerm ||
    p.name.toLowerCase().includes(term) ||
    p.fullName.toLowerCase().includes(term) ||
    p.type.toLowerCase().includes(term) ||
    p.description[language].toLowerCase().includes(term) ||
    p.useCase[language].toLowerCase().includes(term) ||
    p.security[language].toLowerCase().includes(term)
  );
}

export function filterDevices(
  registry: readonly DeviceInfo[],
  category: DeviceCategoryFilter,
  searchTerm: string,
  language: Language
): DeviceInfo[] {
  const term = searchTerm.toLowerCase();
  return registry.filter(d => {
    const categoryMatch = category === 'all' || d.category === category;
    const searchMatch = !searchTerm ||
      d.name.toLowerCase().includes(term) ||
      d.fullName.toLowerCase().includes(term) ||
      d.layer.toLowerCase().includes(term) ||
      d.role[language].toLowerCase().includes(term) ||
      d.howItWorks[language].toLowerCase().includes(term) ||
      d.securityAttacks[language].toLowerCase().includes(term) ||
      d.cannotStop[language].toLowerCase().includes(term) ||
      d.mitigation[language].toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  });
}

export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  return [...items].sort(() => 0.5 - random());
}
