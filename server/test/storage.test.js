import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeSnapshotDiff } from '../src/services/storage.js';

describe('Snapshot Comparison & Diffing Service', () => {
  it('returns changesDetected: false when snapshots are identical', () => {
    const snap1 = {
      id: 'snap_1',
      timestamp: '2026-03-01T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Acme',
        features: ['Feature A', 'Feature B'],
        pricing: [{ plan_name: 'Pro', price: '$20', billing_cycle: 'mo' }],
        target_customers: 'Devs',
      },
    };
    const snap2 = {
      id: 'snap_2',
      timestamp: '2026-03-05T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Acme',
        features: ['Feature A', 'Feature B'],
        pricing: [{ plan_name: 'Pro', price: '$20', billing_cycle: 'mo' }],
        target_customers: 'Devs',
      },
    };

    const diff = computeSnapshotDiff(snap1, snap2);
    assert.equal(diff.changesDetected, false);
    assert.equal(diff.features.added.length, 0);
    assert.equal(diff.features.removed.length, 0);
    assert.equal(diff.pricing.addedPlans.length, 0);
    assert.equal(diff.pricing.removedPlans.length, 0);
    assert.equal(diff.pricing.modifiedPlans.length, 0);
    assert.equal(diff.isDemoComparison, false);
  });

  it('PROVES: missing pricing data in current scan is NOT classified as removed plans', () => {
    const older = {
      id: 'snap_old',
      timestamp: '2026-03-01T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Acme',
        features: ['Feature A'],
        pricing: [
          { plan_name: 'Free', price: '$0' },
          { plan_name: 'Pro', price: '$20' },
        ],
      },
    };
    // Current scan failed to find pricing or pricing page was inaccessible
    const newer = {
      id: 'snap_new',
      timestamp: '2026-03-10T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Acme',
        features: ['Feature A'],
        pricing: [], // Empty pricing array
        unknowns: ['pricing page not accessible'],
      },
    };

    const diff = computeSnapshotDiff(older, newer);
    // MUST NOT classify the 2 previous plans as removed plans!
    assert.equal(diff.pricing.removedPlans.length, 0, 'Missing pricing must NOT be classified as removed plans');
    assert.ok(diff.pricing.notice, 'A notice must explain that pricing data was unavailable');
    assert.match(diff.pricing.notice, /unavailable/i);
  });

  it('PROVES: missing feature data in current scan is NOT classified as removed features', () => {
    const older = {
      id: 'snap_old',
      timestamp: '2026-03-01T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Acme',
        features: ['Keyboard shortcuts', 'Git sync', 'Roadmaps'],
        pricing: [{ plan_name: 'Pro', price: '$20' }],
      },
    };
    // Newer scan has empty features due to transient extraction issue
    const newer = {
      id: 'snap_new',
      timestamp: '2026-03-10T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Acme',
        features: [],
        pricing: [{ plan_name: 'Pro', price: '$20' }],
      },
    };

    const diff = computeSnapshotDiff(older, newer);
    assert.equal(diff.features.removed.length, 0, 'Empty features in new scan must NOT be marked as dropped features');
    assert.ok(diff.features.notice);
    assert.match(diff.features.notice, /unavailable/i);
  });

  it('detects genuine pricing modifications when both scans have pricing', () => {
    const older = {
      id: 'snap_1',
      timestamp: '2026-03-01T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        pricing: [{ plan_name: 'Standard', price: '$7', billing_cycle: 'mo' }],
      },
    };
    const newer = {
      id: 'snap_2',
      timestamp: '2026-03-15T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        pricing: [{ plan_name: 'Standard', price: '$8', billing_cycle: 'mo' }],
      },
    };

    const diff = computeSnapshotDiff(older, newer);
    assert.equal(diff.changesDetected, true);
    assert.equal(diff.pricing.modifiedPlans.length, 1);
    assert.equal(diff.pricing.modifiedPlans[0].oldPrice, '$7');
    assert.equal(diff.pricing.modifiedPlans[0].newPrice, '$8');
  });

  it('PROVES: synthetic demo snapshots are marked and cannot be presented as real historical observation', () => {
    const demoSnap = {
      id: 'snap_demo_seed',
      timestamp: '2026-03-01T00:00:00Z',
      isDemo: true, // Synthetic fixture
      primaryCompany: {
        company_name: 'Linear',
        features: ['Feature 1'],
        pricing: [{ plan_name: 'Standard', price: '$7' }],
      },
    };
    const liveSnap = {
      id: 'snap_live',
      timestamp: '2026-03-15T00:00:00Z',
      isDemo: false,
      primaryCompany: {
        company_name: 'Linear',
        features: ['Feature 1', 'Feature 2'],
        pricing: [{ plan_name: 'Standard', price: '$8' }],
      },
    };

    const diff = computeSnapshotDiff(demoSnap, liveSnap);
    assert.equal(diff.isDemoComparison, true);
    assert.ok(diff.demoNotice, 'Must include demo notice');
    assert.match(diff.demoNotice, /synthetic demo data/i);
  });

  it('does NOT report false target audience shift when audience is unknown or missing', () => {
    const older = {
      id: 'snap_1',
      timestamp: '2026-03-01T00:00:00Z',
      primaryCompany: { target_customers: 'Not specified' },
    };
    const newer = {
      id: 'snap_2',
      timestamp: '2026-03-15T00:00:00Z',
      primaryCompany: { target_customers: 'Modern software engineering teams' },
    };

    const diff = computeSnapshotDiff(older, newer);
    assert.equal(diff.targetAudienceShift, null, 'Must not claim positioning shift from unknown placeholder');
  });
});
