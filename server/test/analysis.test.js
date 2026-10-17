import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateComparisonMatrix, runFullCompetitiveScan, discoverCompetitors } from '../src/services/analysis.js';

describe('Analysis & Competitive Pipeline Service', () => {
  it('generateComparisonMatrix gracefully handles missing/unverified pricing and features', () => {
    const primary = {
      company_name: 'Stealth SaaS',
      features: [],
      pricing: [],
      unknowns: ['pricing not found on website'],
      target_customers: '',
    };
    const comp1 = {
      company_name: 'Rival One',
      features: ['Feature 1'],
      pricing: [{ plan_name: 'Team', price: '$10' }],
    };

    const matrix = generateComparisonMatrix(primary, [comp1]);
    assert.ok(matrix.executive_summary);
    assert.match(matrix.pricing_overview.primary.entryPrice, /Pricing not publicly listed|Unverified/i);
    assert.equal(matrix.pricing_overview.comp1.entryPrice, '$10 (Team)');
    assert.equal(matrix.target_comparison.primary, 'Not publicly specified on website');
  });

  it('PROVES: live scan (forceMock=false) NEVER silently falls back to mock data when API key is missing', async () => {
    const originalKey = process.env.TINYFISH_API_KEY;
    try {
      delete process.env.TINYFISH_API_KEY;
      await assert.rejects(
        async () => {
          await runFullCompetitiveScan('https://linear.app', { forceMock: false });
        },
        (err) => {
          assert.match(err.message, /TINYFISH_API_KEY is not configured/i);
          return true;
        },
        'Live scan must fail when API key is missing instead of falling back to mock fixtures'
      );
    } finally {
      if (originalKey) process.env.TINYFISH_API_KEY = originalKey;
    }
  });

  it('PROVES: explicit mock scan (forceMock=true) is visibly tagged as demo fixture', async () => {
    const result = await runFullCompetitiveScan('https://linear.app', { forceMock: true });
    assert.equal(result.isDemo, true);
    assert.equal(result.snapshot.isDemo, true);
  });

  it('discoverCompetitors in live mode rejects without API key', async () => {
    const originalKey = process.env.TINYFISH_API_KEY;
    try {
      delete process.env.TINYFISH_API_KEY;
      await assert.rejects(
        async () => {
          await discoverCompetitors('Linear', 'https://linear.app', '', { forceMock: false });
        },
        (err) => {
          assert.match(err.message, /TINYFISH_API_KEY is not configured/i);
          return true;
        }
      );
    } finally {
      if (originalKey) process.env.TINYFISH_API_KEY = originalKey;
    }
  });

  it('discoverCompetitors in mock mode returns curated fixtures', async () => {
    const comps = await discoverCompetitors('Linear', 'https://linear.app', '', { forceMock: true });
    assert.equal(comps.length, 2);
    assert.ok(comps[0].company_name);
    assert.ok(comps[0].website_url);
  });
});
