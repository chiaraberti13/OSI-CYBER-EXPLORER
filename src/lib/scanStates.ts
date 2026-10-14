import { SCAN_CASES, type ScanCase, type ScanProtocol, type ScanState } from '../content/scanStates';

/** The protocols the decoder covers, in display order. */
export const SCAN_PROTOCOLS: readonly ScanProtocol[] = ['tcp', 'udp'];

/** The three states a scanner reports, in teaching order. */
export const SCAN_STATES: readonly ScanState[] = ['open', 'closed', 'filtered'];

/** The scan cases for one protocol, in `SCAN_STATES` order. */
export function casesForProtocol(protocol: ScanProtocol): ScanCase[] {
  return SCAN_CASES.filter((scanCase) => scanCase.protocol === protocol).sort(
    (a, b) => SCAN_STATES.indexOf(a.condition) - SCAN_STATES.indexOf(b.condition)
  );
}

/** The single case for a (protocol, condition) pair, or undefined if none exists. */
export function findCase(protocol: ScanProtocol, condition: ScanState): ScanCase | undefined {
  return SCAN_CASES.find((scanCase) => scanCase.protocol === protocol && scanCase.condition === condition);
}
