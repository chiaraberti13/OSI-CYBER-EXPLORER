import { describe, expect, it } from 'vitest';
import {
  ASSESSMENT_EVIDENCE,
  ASSESSMENT_FINDINGS,
  ASSESSMENT_SCOPE,
  buildAssessmentReport,
  calculateTriageIndex,
  confidencePercent,
  triagePriority
} from './assessmentWorkspace';

describe('offline assessment workspace fixtures', () => {
  it('keeps every fixture item traceable and bilingual', () => {
    expect(ASSESSMENT_SCOPE.target).toBe('192.0.2.10/32');
    expect(ASSESSMENT_SCOPE.hostname).toBe('web-01.example.test');
    expect(ASSESSMENT_SCOPE.rules.it).toMatch(/nessuna? richieste? di rete|richieste? di rete/i);
    expect(ASSESSMENT_SCOPE.rules.en).toMatch(/no real scans, network requests/i);
    for (const item of ASSESSMENT_EVIDENCE) {
      expect(item.source).toMatch(/^fixture:\/\//);
      expect(item.observedOn).toBe(ASSESSMENT_SCOPE.observedOn);
      expect(item.confidence).toBeGreaterThanOrEqual(0);
      expect(item.confidence).toBeLessThanOrEqual(100);
      expect(item.statement.it.trim()).not.toBe('');
      expect(item.statement.en.trim()).not.toBe('');
    }
  });

  it('uses a bounded teaching index and keeps weak evidence validation-first', () => {
    expect(ASSESSMENT_FINDINGS.map(calculateTriageIndex)).toEqual([100, 40]);
    expect(ASSESSMENT_FINDINGS.map((finding) => triagePriority(calculateTriageIndex(finding)))).toEqual(['P1', 'P2']);
    expect(ASSESSMENT_FINDINGS[1].confidence).toBeLessThanOrEqual(2);
    expect(ASSESSMENT_FINDINGS[1].validation.en).toMatch(/Do not claim a CVE/i);
    expect(confidencePercent(120)).toBe(100);
    expect(confidencePercent(-5)).toBe(0);
  });

  it('reports observations separately from a dated, low-confidence hypothesis in both languages', () => {
    const hypothesisEvidence = {
      id: 'OS-HYP-01',
      phase: 'os-hypothesis' as const,
      kind: 'hypothesis' as const,
      source: 'derived: fixture://services/web-01.json (ENUM-01)',
      observedOn: ASSESSMENT_SCOPE.observedOn,
      confidence: 45,
      statement: {
        it: 'Linux/Unix-like: ipotesi, non prova; banner e TTL sono indizi deboli.',
        en: 'Linux/Unix-like: hypothesis, not proof; banner and TTL are weak clues.'
      }
    };
    const report = buildAssessmentReport([...ASSESSMENT_EVIDENCE, hypothesisEvidence]);
    expect(report).toContain('# Report assessment (simulazione)');
    expect(report).toContain('# Assessment report (simulation)');
    expect(report).toContain('[OS-HYP-01] Ipotesi:');
    expect(report).toContain('[OS-HYP-01] Hypothesis:');
    expect(report).toContain('not proof');
    expect(report).toContain('confidenza: 45%');
    expect(report).toContain('confidence: 45%');
    expect(report).toContain('not CVSS');
    expect(report.toLowerCase()).toContain('nessuna richiesta è stata inviata');
    expect(report).toContain('No requests were sent');
    expect(report.match(/OS-HYP-01/g)).toHaveLength(2);
  });
});
