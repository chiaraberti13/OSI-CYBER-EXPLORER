import { describe, expect, it } from 'vitest';
import {
  applyWebFixtureRemediations,
  confirmWebLabScope,
  createWebLabState,
  discoverWebFixturePaths,
  inspectOtherFixtureProfile,
  inspectWebFixture,
  runWebFixtureRegressions,
  submitFixtureLoginAttempt,
  WEB_LAB_SCOPE
} from './webApplicationLab';

describe('EJPT-06 offline web application fixture', () => {
  it('refuses all activities until the local scope is explicitly confirmed', () => {
    const initial = createWebLabState();
    expect(inspectWebFixture(initial)).toBe(initial);
    expect(discoverWebFixturePaths(initial)).toBe(initial);
    expect(inspectOtherFixtureProfile(initial)).toBe(initial);
    expect(submitFixtureLoginAttempt(initial)).toBe(initial);
    expect(WEB_LAB_SCOPE.address).toBe('192.0.2.80/32');
  });

  it('records HTTP recon, path discovery, login throttling, and object authorization evidence', () => {
    let state = confirmWebLabScope(createWebLabState());
    state = inspectWebFixture(state);
    state = discoverWebFixturePaths(state);
    state = inspectOtherFixtureProfile(state);
    expect(state.pathsDiscovered).toBe(true);
    expect(state.profileStatus).toBe(200);
    expect(state.evidence.map(({ id }) => id)).toEqual(['http-recon', 'content-discovery', 'object-authorization-200']);
    expect(state.evidence[0].response).toContain('Content-Security-Policy: (missing)');
    expect(state.evidence[1].response).toContain('401 /admin/');
    expect(state.evidence[2].observation.it).toContain('IDOR/BOLA');

    for (let index = 0; index < 6; index += 1) state = submitFixtureLoginAttempt(state);
    expect(state.loginAttempts).toBe(6);
    expect(state.loginBlocked).toBe(false);
    expect(state.evidence.at(-1)?.response).toContain('401 Unauthorized');
    expect(JSON.stringify(state)).not.toMatch(/password\s*[:=]/i);
  });

  it('proves fixes with regression evidence and blocks attempts after the fixture threshold', () => {
    let state = confirmWebLabScope(createWebLabState());
    state = applyWebFixtureRemediations(state);
    state = runWebFixtureRegressions(state);

    expect(state.loginAttempts).toBe(3);
    expect(state.loginBlocked).toBe(true);
    expect(state.evidence.at(-2)?.response).toContain('429 Too Many Requests');
    expect(state.profileStatus).toBe(403);
    expect(state.regressionResults).toEqual([
      { id: 'login-rate-limit', passed: true },
      { id: 'object-authorization', passed: true }
    ]);
  });
});
