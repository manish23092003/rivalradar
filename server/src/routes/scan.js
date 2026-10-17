import { Router } from 'express';
import { runFullCompetitiveScan, DEMO_PRELOADS } from '../services/analysis.js';
import { resetTinyFishClient } from '../services/tinyfish.js';

export const scanRouter = Router();

// Validate input URL
function sanitizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes('.')) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * POST /api/scan
 * Standard synchronous scan endpoint
 */
scanRouter.post('/scan', async (req, res) => {
  const { url, forceMock = false, manualCompetitors = [] } = req.body;

  const validUrl = sanitizeUrl(url);
  if (!validUrl) {
    return res.status(400).json({ error: 'Valid URL is required (e.g. https://linear.app or linear.app)' });
  }

  try {
    console.log(`[scan] Starting competitive scan for: ${validUrl} (forceMock=${forceMock})`);
    const result = await runFullCompetitiveScan(validUrl, {
      forceMock,
      manualCompetitors,
    });
    return res.json(result);
  } catch (err) {
    console.error('[scan] Scan failed:', err);
    return res.status(500).json({ error: err.message || 'Competitive scan failed' });
  }
});

/**
 * GET /api/scan/stream
 * Server-Sent Events (SSE) endpoint for real-time progress updates during the scan!
 */
scanRouter.get('/scan/stream', async (req, res) => {
  const { url, forceMock = 'false', competitors } = req.query;

  const validUrl = sanitizeUrl(url);
  if (!validUrl) {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  const manualCompetitors = competitors ? competitors.split(',').filter(Boolean) : [];
  const isForceMock = forceMock === 'true';

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await runFullCompetitiveScan(validUrl, {
      forceMock: isForceMock,
      manualCompetitors,
      onProgress: (progress) => {
        sendEvent('progress', progress);
      },
    });

    sendEvent('complete', result);
    res.end();
  } catch (err) {
    console.error('[scan-stream] Stream error:', err);
    sendEvent('error', { error: err.message || 'Failed during competitive scan' });
    res.end();
  }
});

/**
 * GET /api/demo-samples
 * Quick 1-click testable companies
 */
scanRouter.get('/demo-samples', (_req, res) => {
  const samples = [
    {
      name: 'Linear',
      url: 'https://linear.app',
      domain: 'linear.app',
      category: 'Project Management & Issue Tracking',
      competitors: ['Jira Software', 'Shortcut'],
      highlight: 'High-speed keyboard-driven issue tracker vs enterprise legacy',
    },
    {
      name: 'Resend',
      url: 'https://resend.com',
      domain: 'resend.com',
      category: 'Developer Email Infrastructure',
      competitors: ['SendGrid', 'Postmark'],
      highlight: 'Modern React email API vs legacy high-volume MTAs',
    },
    {
      name: 'Supabase',
      url: 'https://supabase.com',
      domain: 'supabase.com',
      category: 'Backend-as-a-Service & Database',
      competitors: ['Firebase', 'Neon'],
      highlight: 'Open-source Postgres alternative to proprietary Firebase',
    },
    {
      name: 'Notion',
      url: 'https://notion.so',
      domain: 'notion.so',
      category: 'Workspaces & Knowledge Management',
      competitors: ['Coda', 'Craft'],
      highlight: 'All-in-one team workspace vs specialized canvas docs',
    },
  ];
  res.json({ samples });
});

/**
 * POST /api/settings/key
 * Dynamically set or update TINYFISH_API_KEY
 */
scanRouter.post('/settings/key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'API key is required' });
  }

  process.env.TINYFISH_API_KEY = apiKey.trim();
  resetTinyFishClient();
  console.log('[settings] TinyFish API key updated dynamically in memory.');

  res.json({
    success: true,
    message: 'TinyFish API key configured successfully.',
    configured: true,
  });
});
