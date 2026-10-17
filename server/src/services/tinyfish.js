/**
 * TinyFish integration service.
 *
 * Uses the official @tiny-fish/sdk to call the TinyFish Web Agent API.
 * The SDK reads TINYFISH_API_KEY from the environment automatically.
 *
 * We use the synchronous `agent.run()` method for simplicity in Phase 1.
 * The SDK handles authentication headers and response parsing.
 */

import { TinyFish, RunStatus } from '@tiny-fish/sdk';

// ---------------------------------------------------------------------------
// Singleton client – created once, reused across requests.
// The SDK reads TINYFISH_API_KEY from process.env automatically.
// ---------------------------------------------------------------------------
let _client = null;

export function getTinyFishClient() {
  if (!_client) {
    if (!process.env.TINYFISH_API_KEY) {
      throw new Error(
        'TINYFISH_API_KEY is not set. Add it to server/.env and restart.',
      );
    }
    _client = new TinyFish();
  }
  return _client;
}

export function resetTinyFishClient() {
  _client = null;
}


// ---------------------------------------------------------------------------
// Schema for structured company intelligence extraction
// Note: TinyFish API output_schema supports { type, properties, items, required }
// and rejects unrecognized keys like "description".
// ---------------------------------------------------------------------------
const COMPANY_INTEL_SCHEMA = {
  type: 'object',
  properties: {
    company_name: {
      type: 'string',
    },
    product_summary: {
      type: 'string',
    },
    features: {
      type: 'array',
      items: { type: 'string' },
    },
    pricing: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          plan_name: { type: 'string' },
          price: { type: 'string' },
          billing_cycle: { type: 'string' },
          details: { type: 'string' },
        },
        required: ['plan_name', 'price'],
      },
    },
    target_customers: {
      type: 'string',
    },
    evidence_urls: {
      type: 'array',
      items: { type: 'string' },
    },
    unknowns: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'company_name',
    'product_summary',
    'features',
    'pricing',
    'target_customers',
    'evidence_urls',
    'unknowns',
  ],
};

// ---------------------------------------------------------------------------
// investigateCompany – core research function
// ---------------------------------------------------------------------------

/**
 * Uses TinyFish to visit a company website and extract structured intelligence.
 *
 * @param {string} url – The company website URL (must be https://)
 * @returns {Promise<object>} Structured company data matching COMPANY_INTEL_SCHEMA
 */
export async function investigateCompany(url) {
  const client = getTinyFishClient();

  const goal = `You are a competitive intelligence analyst. Visit this company website and thoroughly research it.

Your tasks:
1. Find the company's official name.
2. Write a one-paragraph summary of their main product or service.
3. List all key product features you can find.
4. Find their pricing page and extract all pricing plans with plan names, prices, and billing cycles.
5. Identify who their target customers are.
6. Keep track of every URL you visit as evidence.
7. Note anything you could not find or confirm as "unknowns".

Important rules:
- Only report facts you can verify from the website content.
- If you cannot find pricing, leave the pricing array empty and add "pricing not found on website" to unknowns.
- If you cannot determine target customers, add it to unknowns.
- Do NOT invent or guess information.

Return the results as structured JSON.`;

  try {
    const run = await client.agent.run({
      url,
      goal,
      output_schema: COMPANY_INTEL_SCHEMA,
    });

    if (run.status === RunStatus.COMPLETED) {
      // The SDK returns `result` as the parsed output matching our schema
      const result = run.result;

      if (!result) {
        return {
          success: false,
          error: 'TinyFish completed but returned no result data.',
          run_id: run.run_id,
        };
      }

      return {
        success: true,
        data: result,
        run_id: run.run_id,
        status: run.status,
      };
    }

    // Run did not complete successfully
    return {
      success: false,
      error: `TinyFish run ended with status: ${run.status}`,
      run_id: run.run_id,
      status: run.status,
      details: run.error || null,
    };
  } catch (err) {
    // Network errors, auth errors, timeouts, etc.
    let safeMessage = err?.message || String(err);
    if (process.env.TINYFISH_API_KEY && process.env.TINYFISH_API_KEY.trim()) {
      safeMessage = safeMessage.replaceAll(process.env.TINYFISH_API_KEY.trim(), '[REDACTED]');
    }
    console.error('[tinyfish] investigateCompany error:', safeMessage);

    return {
      success: false,
      error: safeMessage,
    };
  }
}
