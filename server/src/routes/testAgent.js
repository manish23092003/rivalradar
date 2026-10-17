import { Router } from 'express';
import { investigateCompany } from '../services/tinyfish.js';

export const testAgentRouter = Router();

// ---------------------------------------------------------------------------
// URL validation helpers
// ---------------------------------------------------------------------------

/**
 * Basic URL validation + SSRF protection.
 * Only allows http:// and https:// URLs pointing to public domains.
 */
function validateUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'URL is required.' };
  }

  const trimmed = raw.trim();

  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  // Block private / internal IPs and hostnames
  const hostname = parsed.hostname.toLowerCase();
  const blocked = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '[::1]',
    '169.254.',
    '10.',
    '192.168.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
  ];
  for (const prefix of blocked) {
    if (hostname === prefix || hostname.startsWith(prefix)) {
      return {
        valid: false,
        error: 'URLs pointing to private/internal addresses are not allowed.',
      };
    }
  }

  // Must have a dot in hostname (no bare hostnames like "http://server")
  if (!hostname.includes('.')) {
    return {
      valid: false,
      error: 'URL must point to a public domain (e.g. https://example.com).',
    };
  }

  return { valid: true, url: parsed.href };
}

// ---------------------------------------------------------------------------
// POST /api/test-agent
// ---------------------------------------------------------------------------

testAgentRouter.post('/test-agent', async (req, res) => {
  const { url } = req.body;

  // Validate URL
  const validation = validateUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  console.log(`[test-agent] Investigating: ${validation.url}`);
  const startTime = Date.now();

  try {
    const result = await investigateCompany(validation.url);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[test-agent] Done in ${elapsed}s – success=${result.success}`);

    if (!result.success) {
      return res.status(502).json({
        error: result.error,
        run_id: result.run_id || null,
        details: result.details || null,
      });
    }

    return res.json({
      ...result.data,
      _meta: {
        run_id: result.run_id,
        elapsed_seconds: parseFloat(elapsed),
        queried_url: validation.url,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[test-agent] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
