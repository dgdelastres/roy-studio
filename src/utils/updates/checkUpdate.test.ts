import { describe, it, expect } from 'vitest';
import { compareVersions } from './checkUpdate';

describe('compareVersions semver logic', () => {
  it('detects when remote version is newer', () => {
    expect(compareVersions('1.0.1', '1.0.2')).toBe(1);
    expect(compareVersions('1.0.1', '1.1.0')).toBe(1);
    expect(compareVersions('1.0.1', '2.0.0')).toBe(1);
    expect(compareVersions('v1.0.1', 'v1.0.2')).toBe(1);
    expect(compareVersions('1.0.1', 'v1.0.2')).toBe(1);
  });

  it('detects when versions are identical', () => {
    expect(compareVersions('1.0.1', '1.0.1')).toBe(0);
    expect(compareVersions('v1.0.1', '1.0.1')).toBe(0);
    expect(compareVersions('1.0.1', 'v1.0.1')).toBe(0);
    expect(compareVersions('v1.0.1', 'v1.0.1')).toBe(0);
  });

  it('detects when local version is newer (prerelease / dev)', () => {
    expect(compareVersions('1.0.2', '1.0.1')).toBe(-1);
    expect(compareVersions('2.0.0', '1.0.9')).toBe(-1);
    expect(compareVersions('v1.1.0', 'v1.0.5')).toBe(-1);
  });
});
