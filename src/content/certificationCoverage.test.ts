import { describe, expect, it } from 'vitest';
import { CCNA_BLUEPRINT_TOPICS } from './ccnaBlueprint';
import {
  CERTIFICATION_COVERAGE_OBJECTIVES,
  CERTIFICATION_SOURCES,
  CCNA_COVERAGE_OBJECTIVES,
  COVERAGE_LEVELS,
  EJPT_COVERAGE_DOMAINS,
  EJPT_COVERAGE_OBJECTIVES,
  coverageMeetsMinimum,
  minimumCoverageForVerb
} from './certificationCoverage';
import { VIEW_REGISTRY } from './viewRegistry';
import { STUDY_MANUAL } from './studyManualSupplement';

describe('granular certification coverage matrix', () => {
  it('pins current official sources, review date and domain weights', () => {
    expect(CERTIFICATION_SOURCES.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new URL(CERTIFICATION_SOURCES.ccna.url).hostname).toBe('learningcontent.cisco.com');
    expect(new URL(CERTIFICATION_SOURCES.ejpt.url).hostname).toBe('ine.com');
    expect(EJPT_COVERAGE_DOMAINS.map((domain) => domain.weight)).toEqual([35, 25, 25, 15]);
    expect(EJPT_COVERAGE_DOMAINS.reduce((sum, domain) => sum + domain.weight, 0)).toBe(100);
  });

  it('contains every CCNA parent, all 58 published subobjectives, and all 22 INE objectives', () => {
    const parentIds = CCNA_COVERAGE_OBJECTIVES.filter((objective) => !objective.parentId).map(
      (objective) => objective.id
    );
    expect(parentIds).toEqual(CCNA_BLUEPRINT_TOPICS.map((topic) => topic.id));
    expect(CCNA_COVERAGE_OBJECTIVES.filter((objective) => objective.parentId)).toHaveLength(58);
    expect(CCNA_COVERAGE_OBJECTIVES).toHaveLength(111);
    expect(EJPT_COVERAGE_OBJECTIVES).toHaveLength(22);

    const expectedSubobjectives = [
      '1.1.a',
      '1.1.b',
      '1.1.c',
      '1.1.d',
      '1.1.e',
      '1.1.f',
      '1.1.g',
      '1.1.h',
      '1.2.a',
      '1.2.b',
      '1.2.c',
      '1.2.d',
      '1.2.e',
      '1.2.f',
      '1.3.a',
      '1.3.b',
      '1.9.a',
      '1.9.b',
      '1.9.c',
      '1.9.d',
      '1.11.a',
      '1.11.b',
      '1.11.c',
      '1.11.d',
      '1.13.a',
      '1.13.b',
      '1.13.c',
      '1.13.d',
      '2.1.a',
      '2.1.b',
      '2.1.c',
      '2.2.a',
      '2.2.b',
      '2.2.c',
      '2.5.a',
      '2.5.b',
      '2.5.c',
      '2.5.d',
      '3.1.a',
      '3.1.b',
      '3.1.c',
      '3.1.d',
      '3.1.e',
      '3.1.f',
      '3.1.g',
      '3.2.a',
      '3.2.b',
      '3.2.c',
      '3.3.a',
      '3.3.b',
      '3.3.c',
      '3.3.d',
      '3.4.a',
      '3.4.b',
      '3.4.c',
      '3.4.d',
      '6.3.a',
      '6.3.b'
    ];
    expect(CCNA_COVERAGE_OBJECTIVES.filter((objective) => objective.parentId).map((objective) => objective.id)).toEqual(
      expectedSubobjectives
    );
    expect(EJPT_COVERAGE_OBJECTIVES.map((objective) => objective.id)).toEqual([
      'EJPT-HNPT-01',
      'EJPT-HNPT-02',
      'EJPT-HNPT-03',
      'EJPT-HNPT-04',
      'EJPT-AM-01',
      'EJPT-AM-02',
      'EJPT-AM-03',
      'EJPT-AM-04',
      'EJPT-AM-05',
      'EJPT-AM-06',
      'EJPT-AM-07',
      'EJPT-AM-08',
      'EJPT-HNA-01',
      'EJPT-HNA-02',
      'EJPT-HNA-03',
      'EJPT-HNA-04',
      'EJPT-HNA-05',
      'EJPT-HNA-06',
      'EJPT-WAPT-01',
      'EJPT-WAPT-02',
      'EJPT-WAPT-03',
      'EJPT-WAPT-04'
    ]);
  });

  it('keeps IDs unique, bilingual labels complete, and destinations registered', () => {
    const ids = CERTIFICATION_COVERAGE_OBJECTIVES.map((objective) => objective.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const objective of CERTIFICATION_COVERAGE_OBJECTIVES) {
      expect(objective.title.it.trim(), `${objective.id} has no Italian title`).not.toBe('');
      expect(objective.title.en.trim(), `${objective.id} has no English title`).not.toBe('');
      expect(COVERAGE_LEVELS).toContain(objective.coverageLevel);
      expect(objective.destinations.length, `${objective.id} has no destination`).toBeGreaterThan(0);
      expect(new Set(objective.destinations).size, `${objective.id} repeats a destination`).toBe(
        objective.destinations.length
      );
      for (const destination of objective.destinations) {
        expect(VIEW_REGISTRY[destination], `${objective.id} points to stale view ${destination}`).toBeDefined();
      }
    }
  });

  it('requires guided evidence for operational verbs before an objective can be covered', () => {
    expect(minimumCoverageForVerb('configure and verify')).toBe('guided');
    expect(minimumCoverageForVerb('conduct')).toBe('guided');
    expect(minimumCoverageForVerb('demonstrate')).toBe('guided');
    expect(minimumCoverageForVerb('identify and modify')).toBe('guided');
    expect(minimumCoverageForVerb('describe')).toBe('theory');

    for (const objective of CERTIFICATION_COVERAGE_OBJECTIVES) {
      expect(objective.minimumLevel).toBe(minimumCoverageForVerb(objective.verb));
      if (objective.status === 'covered') {
        expect(
          coverageMeetsMinimum(objective.coverageLevel, objective.minimumLevel),
          `${objective.id} is marked covered below its ${objective.minimumLevel} requirement`
        ).toBe(true);
        expect(objective.roadmapTask, `${objective.id} is covered but still points to the roadmap`).toBeUndefined();
      } else {
        expect(objective.roadmapTask, `${objective.id} is partial without a remediation task`).toMatch(
          /^(CCNA|EJPT)-\d{2}$/
        );
      }
    }
  });

  it('marks the wireless deployment and AP-mode descriptions complete after CCNA-02', () => {
    for (const id of ['2.6', '2.7']) {
      const objective = CCNA_COVERAGE_OBJECTIVES.find((entry) => entry.id === id);
      expect(objective, `${id} exists`).toBeDefined();
      expect(objective?.status).toBe('covered');
      expect(objective?.coverageLevel).toBe('theory');
      expect(objective?.roadmapTask).toBeUndefined();
    }
  });

  it('requires guided evidence for CCNA 4.1 and marks NAT complete only after its lab exists', () => {
    const nat = CCNA_COVERAGE_OBJECTIVES.find((entry) => entry.id === '4.1');
    expect(nat).toMatchObject({ status: 'covered', coverageLevel: 'guided', minimumLevel: 'guided' });
    expect(nat?.roadmapTask).toBeUndefined();
    expect(
      STUDY_MANUAL.flatMap((chapter) => chapter.topics)
        .find((topic) => topic.id === 'nat-pat')
        ?.guidedLabs?.some((lab) => lab.id === 'gl-nat-static-dynamic')
    ).toBe(true);
  });

  it('marks CCNA 3.3 covered only with guided IPv6 route and failover evidence', () => {
    const objectives = CCNA_COVERAGE_OBJECTIVES.filter((entry) => entry.id === '3.3' || entry.parentId === '3.3');
    expect(objectives.length).toBeGreaterThan(1);
    expect(objectives.every((entry) => entry.status === 'covered' && entry.coverageLevel === 'guided')).toBe(true);
    expect(objectives.every((entry) => entry.roadmapTask === undefined)).toBe(true);
    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'static-default-routes'
    );
    expect(topic?.guidedLabs?.some((lab) => lab.id === 'gl-static-ipv6-routes')).toBe(true);
    const evidence = JSON.stringify(topic).toLowerCase();
    for (const term of [
      '2001:db8:20::/48',
      '2001:db8:20::50/128',
      'fe80::2',
      'show ipv6 route',
      'ping ipv6',
      'longest-prefix'
    ]) {
      expect(evidence).toContain(term);
    }
  });

  it('requires a bilingual NTP client/server lab before marking CCNA 4.2 complete', () => {
    const ntp = CCNA_COVERAGE_OBJECTIVES.find((entry) => entry.id === '4.2');
    expect(ntp).toMatchObject({ status: 'covered', coverageLevel: 'guided', minimumLevel: 'guided' });
    expect(ntp?.roadmapTask).toBeUndefined();
    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find((entry) => entry.id === 'ip-services-ntp');
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-ntp-client-server');
    expect(lab).toBeDefined();
    expect(JSON.stringify(lab)).toContain('show ntp associations');
    expect(JSON.stringify(lab)).toContain('show ntp status');
    expect(JSON.stringify(lab)).toContain('192.0.2.123');
    expect(JSON.stringify(lab)).toContain('192.0.2.124');
    expect(JSON.stringify(lab)).not.toMatch(/(?:password|secret|key)\s+[A-Za-z0-9+/]{12,}/i);
  });

  it('requires bilingual BPDU filter comparison and recovery evidence for CCNA 2.5.d', () => {
    const objectives = CCNA_COVERAGE_OBJECTIVES.filter((entry) => entry.id === '2.5' || entry.id === '2.5.d');
    expect(objectives).toHaveLength(2);
    expect(objectives.every((entry) => entry.status === 'covered')).toBe(true);
    const objective = objectives.find((entry) => entry.id === '2.5.d');
    expect(objective).toMatchObject({ coverageLevel: 'guided', minimumLevel: 'theory' });
    expect(objective?.roadmapTask).toBeUndefined();

    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'l2-topology-containment'
    );
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-bpdu-filter-safety');
    expect(lab).toBeDefined();
    const evidence = JSON.stringify({ topic, lab }).toLowerCase();
    for (const phrase of [
      'spanning-tree portfast bpdufilter default',
      'spanning-tree bpdufilter enable',
      'bpdu guard',
      'root guard',
      'loop guard',
      'err-disable',
      'show spanning-tree inconsistentports',
      'shutdown',
      'filtro bpdu',
      'disables filtering'
    ]) {
      expect(evidence).toContain(phrase);
    }
    expect(lab?.steps.length).toBeGreaterThanOrEqual(4);
    expect(lab?.solution.length).toBeGreaterThanOrEqual(2);
    for (const field of ['scenario', 'task', 'challenge'] as const) {
      expect(lab?.[field].it.length).toBeGreaterThan(20);
      expect(lab?.[field].en.length).toBeGreaterThan(20);
    }
  });

  it('maps eJPT assessment objectives to the gated, bilingual evidence workspace', () => {
    const objectiveIds = [
      'EJPT-AM-01',
      'EJPT-AM-02',
      'EJPT-AM-03',
      'EJPT-AM-04',
      'EJPT-AM-05',
      'EJPT-AM-06',
      'EJPT-AM-07',
      'EJPT-AM-08'
    ];
    for (const id of objectiveIds) {
      const objective = EJPT_COVERAGE_OBJECTIVES.find((entry) => entry.id === id);
      expect(objective, `${id} exists`).toBeDefined();
      expect(objective?.destinations).toContain('assessment');
      expect(objective?.roadmapTask).toBeUndefined();
    }
    for (const id of ['EJPT-AM-04', 'EJPT-AM-05', 'EJPT-AM-06', 'EJPT-AM-08']) {
      expect(EJPT_COVERAGE_OBJECTIVES.find((entry) => entry.id === id)).toMatchObject({
        status: 'covered',
        coverageLevel: 'guided'
      });
    }

    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'pentest-scanning-enumeration'
    );
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-assessment-evidence-workspace');
    expect(lab?.lab).toBe('assessment');
    expect(lab?.steps).toHaveLength(5);
    expect(lab?.scenario.it).toContain('192.0.2.10/32');
    expect(lab?.scenario.en).toContain('192.0.2.10/32');
    for (const term of ['fonte', 'confidenza', 'banner', 'TTL', 'fixture', 'no network requests', 'non è CVSS']) {
      expect(JSON.stringify({ topic, lab }).toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it('maps practical eJPT exploit objectives to the sandboxed workbench', () => {
    for (const id of ['EJPT-HNPT-01', 'EJPT-HNPT-02']) {
      const objective = EJPT_COVERAGE_OBJECTIVES.find((entry) => entry.id === id);
      expect(objective).toMatchObject({ status: 'covered', coverageLevel: 'interactive' });
      expect(objective?.roadmapTask).toBeUndefined();
      expect(objective?.destinations).toContain('exploitlab');
    }
    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'exploitation-frameworks-metasploit'
    );
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-exploit-workbench');
    expect(lab?.lab).toBe('exploitlab');
    expect(lab?.steps).toHaveLength(6);
    expect(lab?.scenario.it).toContain('LAB-MOD-01');
    expect(lab?.scenario.en).toContain('LAB-MOD-01');
    expect(lab?.task.it).toContain('ripristina');
    expect(lab?.task.en).toContain('restore');
    expect(lab?.scenario.it).toContain('non esistono');
    expect(lab?.scenario.en).toContain('no CVE');
  });

  it('distinguishes staged packaging from reverse and bind flow direction in both languages', () => {
    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'exploitation-frameworks-metasploit'
    );
    expect(topic?.theory[1].it).toContain('modalità reverse');
    expect(topic?.theory[1].it).toContain('modalità bind');
    expect(topic?.theory[1].en).toContain('in reverse mode');
    expect(topic?.theory[1].en).toContain('in bind mode');
    expect(topic?.theory[1].it).not.toContain('staged/stageless');
    expect(topic?.theory[1].en).not.toContain('staged/stageless');
    expect(topic?.example?.it).toContain('peer autorizzato');
    expect(topic?.example?.en).toContain('authorized peer');
    expect(topic?.commonMistakes[2].it).toContain('reverse e bind');
    expect(topic?.commonMistakes[2].en).toContain('reverse and bind');
  });

  it('maps practical eJPT pivoting to a scoped and teardown-tested interactive lab', () => {
    const objective = EJPT_COVERAGE_OBJECTIVES.find((entry) => entry.id === 'EJPT-HNPT-03');
    expect(objective).toMatchObject({ status: 'covered', coverageLevel: 'interactive' });
    expect(objective?.roadmapTask).toBeUndefined();
    expect(objective?.destinations).toContain('pivotlab');

    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'lateral-movement-pivoting'
    );
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-pivot-route-port-forward');
    expect(lab?.lab).toBe('pivotlab');
    expect(lab?.steps).toHaveLength(6);
    expect(lab?.scenario.it).toContain('203.0.113.25');
    expect(lab?.scenario.en).toContain('203.0.113.25');
    for (const term of ['/32', '8443', '10 minuti', 'teardown', 'IDS']) {
      expect(JSON.stringify({ topic, lab }).toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it('maps online brute force and offline hash work to separate synthetic exercises', () => {
    const objective = EJPT_COVERAGE_OBJECTIVES.find((entry) => entry.id === 'EJPT-HNPT-04');
    expect(objective).toMatchObject({ status: 'covered', coverageLevel: 'interactive' });
    expect(objective?.roadmapTask).toBeUndefined();
    expect(objective?.destinations).toContain('passwordlab');

    const topics = STUDY_MANUAL.flatMap((chapter) => chapter.topics);
    const online = topics.find((entry) => entry.id === 'pentest-password-attacks');
    const offline = topics.find((entry) => entry.id === 'offline-hash-cracking-defense');
    const onlineLab = online?.guidedLabs?.find((entry) => entry.id === 'gl-online-password-controls');
    const offlineLab = offline?.guidedLabs?.find((entry) => entry.id === 'gl-offline-hash-cost');
    expect(onlineLab?.lab).toBe('passwordlab');
    expect(onlineLab?.steps).toHaveLength(5);
    expect(offlineLab?.lab).toBe('passwordlab');
    expect(offlineLab?.steps).toHaveLength(5);
    for (const term of ['rate limit', 'lockout', 'spray', 'fixture-user']) {
      expect(JSON.stringify({ online, onlineLab }).toLowerCase()).toContain(term.toLowerCase());
    }
    expect(onlineLab?.scenario.it).toContain('nessuna password');
    expect(onlineLab?.scenario.en).toContain('no real password');
    for (const term of ['salt', 'Argon2id', 'candidate', 'no hash function', 'offline']) {
      expect(JSON.stringify({ offline, offlineLab }).toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it('maps all six host and network auditing objectives to the controlled evidence workbench', () => {
    const objectives = EJPT_COVERAGE_OBJECTIVES.filter((entry) => entry.id.startsWith('EJPT-HNA-'));
    expect(objectives).toHaveLength(6);
    for (const objective of objectives) {
      expect(objective).toMatchObject({ status: 'covered', coverageLevel: 'interactive' });
      expect(objective.roadmapTask).toBeUndefined();
      expect(objective.destinations).toContain('auditlab');
    }

    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'host-network-auditing'
    );
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-host-audit-evidence-custody');
    expect(lab?.lab).toBe('auditlab');
    expect(lab?.steps).toHaveLength(5);
    expect(lab?.scenario.it).toContain('hash reali non sono presenti');
    expect(lab?.scenario.en).toContain('no real password or hash');
    for (const term of ['SHA-256', 'allowlisted', 'encrypted channel', 'cleanup']) {
      expect(JSON.stringify({ topic, lab }).toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it('maps all web application objectives to the scoped interactive fixture', () => {
    const objectives = EJPT_COVERAGE_OBJECTIVES.filter((entry) => entry.id.startsWith('EJPT-WAPT-'));
    expect(objectives).toHaveLength(4);
    for (const objective of objectives) {
      expect(objective).toMatchObject({ status: 'covered', coverageLevel: 'interactive' });
      expect(objective.minimumLevel).toBe(minimumCoverageForVerb(objective.verb));
      expect(objective.destinations).toContain('weblab');
      expect(objective.roadmapTask).toBeUndefined();
    }
    const topic = STUDY_MANUAL.flatMap((chapter) => chapter.topics).find(
      (entry) => entry.id === 'web-auth-session-access'
    );
    const lab = topic?.guidedLabs?.find((entry) => entry.id === 'gl-web-application-offline-assessment');
    expect(lab?.lab).toBe('weblab');
    expect(lab?.steps).toHaveLength(6);
    expect(lab?.scenario.it).toContain('192.0.2.80/32');
    expect(lab?.scenario.en).toContain('192.0.2.80/32');
    expect(JSON.stringify(lab)).toContain('HTTP');
    expect(JSON.stringify(lab)).toContain('BOLA/IDOR');
    expect(JSON.stringify(lab)).toContain('regression');
  });
});
