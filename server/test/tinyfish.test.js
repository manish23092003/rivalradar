import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('TinyFish SDK Integration & Schema Verification', () => {
  it('PROVES: COMPANY_INTEL_SCHEMA contains no unsupported description fields', async () => {
    const tinyfishSrc = await fs.readFile(
      path.resolve(__dirname, '../src/services/tinyfish.js'),
      'utf-8'
    );

    // Extract COMPANY_INTEL_SCHEMA block
    const schemaMatch = tinyfishSrc.match(/const COMPANY_INTEL_SCHEMA = ({[\s\S]*?});\n\n/);
    assert.ok(schemaMatch, 'COMPANY_INTEL_SCHEMA must be defined in tinyfish.js');
    
    // Check that no "description:" exists in COMPANY_INTEL_SCHEMA
    const schemaContent = schemaMatch[1];
    assert.equal(
      schemaContent.includes('description:'),
      false,
      'COMPANY_INTEL_SCHEMA must not include "description:" as TinyFish API rejects it'
    );
  });

  it('PROVES: API key secrets are redacted in error messages', async () => {
    const fakeKey = 'sk-tinyfish-SUPERSECRET12345';
    process.env.TINYFISH_API_KEY = fakeKey;

    const { investigateCompany, resetTinyFishClient } = await import('../src/services/tinyfish.js');
    resetTinyFishClient();

    // Call with invalid URL to induce error
    const res = await investigateCompany('http://invalid-local-domain');
    assert.equal(res.success, false);
    assert.equal(
      res.error?.includes(fakeKey),
      false,
      'Error message must NEVER contain the raw API key secret'
    );
  });
});
