import { investigateCompany, getTinyFishClient } from './tinyfish.js';
import { saveSnapshot, getPreviousSnapshotForDomain, computeSnapshotDiff } from './storage.js';

// ---------------------------------------------------------------------------
// Curated direct competitors for popular SaaS products (reliable demo/fallback)
// ---------------------------------------------------------------------------
const CURATED_COMPETITORS = {
  'linear.app': [
    { company_name: 'Jira Software', website_url: 'https://www.atlassian.com/software/jira', reason: 'Industry standard agile issue tracker' },
    { company_name: 'Shortcut', website_url: 'https://shortcut.com', reason: 'Fast project management designed for modern dev teams' },
  ],
  'resend.com': [
    { company_name: 'SendGrid', website_url: 'https://sendgrid.com', reason: 'Dominant transactional email provider' },
    { company_name: 'Postmark', website_url: 'https://postmarkapp.com', reason: 'Developer-focused transactional email delivery' },
  ],
  'supabase.com': [
    { company_name: 'Firebase', website_url: 'https://firebase.google.com', reason: 'Google’s serverless backend-as-a-service platform' },
    { company_name: 'Neon', website_url: 'https://neon.tech', reason: 'Serverless Postgres database with instant branching' },
  ],
  'notion.so': [
    { company_name: 'Coda', website_url: 'https://coda.io', reason: 'All-in-one collaborative doc & database platform' },
    { company_name: 'Craft', website_url: 'https://www.craft.do', reason: 'Document and notes app for teams and individuals' },
  ],
  'stripe.com': [
    { company_name: 'Adyen', website_url: 'https://www.adyen.com', reason: 'Global omnichannel payment processing' },
    { company_name: 'Paddle', website_url: 'https://www.paddle.com', reason: 'Merchant of Record and billing platform for SaaS' },
  ],
};

// ---------------------------------------------------------------------------
// Rich preloaded intelligence for instant offline demo or fallback
// ---------------------------------------------------------------------------
export const DEMO_PRELOADS = {
  'linear.app': {
    targetUrl: 'https://linear.app',
    primaryCompany: {
      company_name: 'Linear',
      product_summary: 'Linear is a purpose-built tool for modern software development, streamlining issue tracking, project planning, and product roadmaps with blazingly fast keyboard-first workflows.',
      features: [
        'High-velocity keyboard-driven issue tracking',
        'Cycles and automated sprint management',
        'Project roadmaps with milestone dependencies',
        'Linear Asks for internal support & triage',
        'Customer Requests integration with Zendesk/Intercom',
        'Native Git & GitHub sync with branch automation',
        'Real-time offline sync & instant search',
      ],
      pricing: [
        { plan_name: 'Free', price: '$0', billing_cycle: 'Forever', details: 'Up to 250 active issues, unlimited members, Slack & GitHub integrations' },
        { plan_name: 'Standard', price: '$8', billing_cycle: 'per user/month billed annually', details: 'Unlimited issues, guest accounts, custom issue templates, admin roles' },
        { plan_name: 'Plus', price: '$14', billing_cycle: 'per user/month billed annually', details: 'Linear Insights, SLA management, automated workflows, priority support' },
        { plan_name: 'Enterprise', price: 'Custom', billing_cycle: 'Annual contract', details: 'SAML SSO, SCIM provisioning, dedicated customer success, custom MSA' },
      ],
      target_customers: 'Product-led tech companies, engineering teams, fast-moving startups and scale-ups',
      evidence_urls: ['https://linear.app', 'https://linear.app/pricing', 'https://linear.app/features'],
      unknowns: [],
    },
    competitors: [
      {
        company_name: 'Jira Software',
        product_summary: 'Atlassian Jira Software is the enterprise standard issue and agile project management tool with extensive workflow customization, release tracking, and deep enterprise governance.',
        features: [
          'Scrum and Kanban boards with custom workflows',
          'Advanced roadmaps and portfolio management',
          'Atlassian Intelligence AI summaries & issue creation',
          '3,000+ Marketplace apps and integrations',
          'Enterprise permission schemes and audit logs',
          'DevOps toolchain integration across CI/CD pipelines',
        ],
        pricing: [
          { plan_name: 'Free', price: '$0', billing_cycle: 'Up to 10 users', details: 'Basic boards, 2GB storage, community support' },
          { plan_name: 'Standard', price: '$7.16', billing_cycle: 'per user/month (approx)', details: '1 project role, 250GB storage, 9-to-5 support' },
          { plan_name: 'Premium', price: '$12.48', billing_cycle: 'per user/month', details: 'Advanced roadmaps, unlimited storage, 24/7 support, 99.9% uptime SLA' },
          { plan_name: 'Enterprise', price: 'Custom', billing_cycle: 'Annual billing only', details: 'Unlimited sites, centralized user management, 99.95% SLA' },
        ],
        target_customers: 'Mid-market to Fortune 500 enterprises, cross-functional engineering organizations',
        evidence_urls: ['https://www.atlassian.com/software/jira', 'https://www.atlassian.com/software/jira/pricing'],
        unknowns: [],
      },
      {
        company_name: 'Shortcut',
        product_summary: 'Shortcut (formerly Clubhouse) bridges the gap between modern speed and enterprise visibility, offering agile project tracking with Docs and Objectives alignment.',
        features: [
          'Stories, Epics, Milestones, and Iterations',
          'Integrated Shortcut Docs tied to development tasks',
          'Objectives & Key Results (OKRs) progress rollups',
          'Custom workflows and automation rules',
          'GitHub, GitLab, and Figma integrations',
        ],
        pricing: [
          { plan_name: 'Free', price: '$0', billing_cycle: 'Up to 10 users', details: 'Unlimited docs, core issue tracking' },
          { plan_name: 'Team', price: '$8.50', billing_cycle: 'per user/month billed annually', details: 'Unlimited users, advanced automation, integrations' },
          { plan_name: 'Business', price: '$12', billing_cycle: 'per user/month billed annually', details: 'Advanced roadmaps, OKR tracking, priority support' },
          { plan_name: 'Enterprise', price: 'Custom', billing_cycle: 'Annual contract', details: 'SAML SSO, dedicated CSM, custom terms' },
        ],
        target_customers: 'Growth-stage software development teams seeking more agility than Jira',
        evidence_urls: ['https://shortcut.com', 'https://shortcut.com/pricing'],
        unknowns: [],
      },
    ],
  },
  'resend.com': {
    targetUrl: 'https://resend.com',
    primaryCompany: {
      company_name: 'Resend',
      product_summary: 'Resend is the email platform for developers, providing an intuitive modern API and React Email templates to build, test, and send high-deliverability transactional and marketing emails.',
      features: [
        'React Email component library integration',
        'First-class REST API with multi-language SDKs',
        'Webhooks and real-time delivery event tracking',
        'Domain verification with automated DNS checks',
        'Audiences and broadcast marketing campaigns',
        'Modern analytics dashboard with opens, clicks, bounces',
      ],
      pricing: [
        { plan_name: 'Free', price: '$0', billing_cycle: 'Monthly', details: '3,000 emails/month, 100 emails/day, 1 domain' },
        { plan_name: 'Pro', price: '$20', billing_cycle: 'starting at /month', details: '50,000 emails/month, dedicated IP add-on, unlimited domains' },
        { plan_name: 'Enterprise', price: 'Custom', billing_cycle: 'Annual contract', details: 'High-volume deliverability consulting, custom SLAs, dedicated Slack' },
      ],
      target_customers: 'Next.js & React developers, modern software startups, SaaS engineers',
      evidence_urls: ['https://resend.com', 'https://resend.com/pricing'],
      unknowns: [],
    },
    competitors: [
      {
        company_name: 'SendGrid',
        product_summary: 'Twilio SendGrid is an enterprise cloud-based email delivery service powering transactional and marketing campaigns with massive global scale.',
        features: [
          'High-throughput MTA infrastructure handling billions of emails',
          'Marketing Campaigns visual drag-and-drop builder',
          'Expert deliverability advisory and dedicated IP pools',
          'Subuser management and deep compliance tooling',
        ],
        pricing: [
          { plan_name: 'Free', price: '$0', billing_cycle: 'Monthly', details: '100 emails/day forever' },
          { plan_name: 'Essentials', price: '$19.95', billing_cycle: '/month', details: 'Up to 50,000 emails/month, email support' },
          { plan_name: 'Pro', price: '$89.95', billing_cycle: '/month', details: 'Up to 100,000 emails/month, dedicated IP included' },
          { plan_name: 'Premier', price: 'Custom', billing_cycle: 'Annual', details: 'Custom volume, sub-accounts, 24/7 phone support' },
        ],
        target_customers: 'High-volume enterprise senders, digital marketing teams, global corporations',
        evidence_urls: ['https://sendgrid.com', 'https://sendgrid.com/pricing'],
        unknowns: [],
      },
      {
        company_name: 'Postmark',
        product_summary: 'Postmark (by ActiveCampaign) specializes in lightning-fast transactional email delivery with separate infrastructure for transactional vs promotional mail.',
        features: [
          'Guaranteed transactional message prioritization',
          '45-day message history with full body inspection',
          'Inbound email processing webhooks',
          'Pre-built responsive email templates',
        ],
        pricing: [
          { plan_name: 'Developer', price: '$15', billing_cycle: '/month', details: '10,000 emails/month ($1.80 per extra 1k)' },
          { plan_name: 'Growth', price: '$55', billing_cycle: '/month', details: '50,000 emails/month ($1.50 per extra 1k)' },
          { plan_name: 'Scale', price: '$115', billing_cycle: '/month', details: '125,000 emails/month' },
        ],
        target_customers: 'Developers and SaaS founders obsessed with inbox delivery speed and visibility',
        evidence_urls: ['https://postmarkapp.com', 'https://postmarkapp.com/pricing'],
        unknowns: [],
      },
    ],
  },
};

/**
 * Discovers 2 genuine direct competitors for a given company.
 * In live mode (forceMock=false), calls TinyFish autonomous agent.
 * In explicit mock mode (forceMock=true), uses curated fixtures.
 */
export async function discoverCompetitors(companyName, targetUrl, productSummary = '', { forceMock = false } = {}) {
  let domain = '';
  try {
    domain = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    domain = targetUrl.toLowerCase();
  }

  // Explicit mock mode: use curated demo fixtures
  if (forceMock) {
    if (CURATED_COMPETITORS[domain]) {
      return CURATED_COMPETITORS[domain];
    }
    return [
      { company_name: `${companyName || 'Competitor'} A`, website_url: `https://${domain}-alt1.com`, reason: 'Demo market rival fixture' },
      { company_name: `${companyName || 'Competitor'} B`, website_url: `https://${domain}-alt2.com`, reason: 'Demo market rival fixture' },
    ];
  }

  // Genuine live mode: TinyFish agent required
  if (!process.env.TINYFISH_API_KEY) {
    throw new Error('TINYFISH_API_KEY is not configured. Live competitor discovery requires a valid TinyFish API key.');
  }

  const client = getTinyFishClient();
  console.log(`[analysis] Asking TinyFish agent to discover direct competitors for ${companyName || domain}`);

  const prompt = `Identify the top 2 genuine direct competitors to "${companyName || domain}" (${targetUrl}).
Product context: ${productSummary || 'SaaS or tech product'}.
For each competitor, provide:
1. Official company name
2. Real website URL (must start with https://)
3. One sentence on why they are a direct competitor.
Do not fabricate URLs. Only report real competitor companies with public websites.`;

  const schema = {
    type: 'object',
    properties: {
      competitors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            company_name: { type: 'string' },
            website_url: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['company_name', 'website_url'],
        },
      },
    },
    required: ['competitors'],
  };

  const run = await client.agent.run({
    url: targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
    goal: prompt,
    output_schema: schema,
  });

  if (run.status !== 'COMPLETED' || !run.result?.competitors?.length) {
    const errorMsg = run.error?.message || `TinyFish agent run ended with status ${run.status}`;
    throw new Error(`Failed to discover competitors via TinyFish: ${errorMsg}`);
  }

  const discovered = run.result.competitors.filter(c => c && c.website_url && /^https?:\/\//i.test(c.website_url));
  if (discovered.length < 2) {
    throw new Error(`TinyFish returned fewer than 2 valid competitor websites (${discovered.length} found).`);
  }

  return discovered.slice(0, 2);
}

/**
 * Generates synthesis matrix comparing primary company against its 2 competitors.
 */
export function generateComparisonMatrix(primary, competitors = []) {
  const comp1 = competitors[0] || {};
  const comp2 = competitors[1] || {};

  // Find lowest entry price for each
  const getEntryPrice = (company) => {
    const plans = company.pricing || [];
    if (!plans || plans.length === 0) {
      return (company.unknowns || []).some(u => u.toLowerCase().includes('pricing'))
        ? 'Pricing not publicly listed / Unverified'
        : 'Contact sales / Custom';
    }
    const freePlan = plans.find(p => p.plan_name?.toLowerCase().includes('free') || p.price?.includes('$0') || p.price?.toLowerCase() === 'free');
    if (freePlan) return 'Free tier available ($0)';
    const paid = plans.find(p => p.price && p.price !== '$0' && !p.price.toLowerCase().includes('custom'));
    return paid ? `${paid.price} (${paid.plan_name})` : (plans[0]?.price || 'Contact sales');
  };

  const primaryEntry = getEntryPrice(primary);
  const comp1Entry = getEntryPrice(comp1);
  const comp2Entry = getEntryPrice(comp2);

  // Cross-feature comparison based strictly on returned features
  const allFeatures = [
    ...(primary.features || []).slice(0, 4),
    ...(comp1.features || []).slice(0, 2),
    ...(comp2.features || []).slice(0, 2),
  ];
  const uniqueFeatureThemes = [...new Set(allFeatures.map(f => f.trim()))].filter(Boolean).slice(0, 6);

  const featureMatrix = uniqueFeatureThemes.map(feature => ({
    feature,
    primarySupported: (primary.features || []).some(f => f.toLowerCase().includes(feature.toLowerCase()) || feature.toLowerCase().includes(f.toLowerCase())),
    comp1Supported: (comp1.features || []).some(f => f.toLowerCase().includes(feature.toLowerCase()) || feature.toLowerCase().includes(f.toLowerCase())),
    comp2Supported: (comp2.features || []).some(f => f.toLowerCase().includes(feature.toLowerCase()) || feature.toLowerCase().includes(f.toLowerCase())),
  }));

  // Strategic Insights
  const primaryStrengths = (primary.features || []).slice(0, 3);
  const targetComparison = {
    primary: primary.target_customers || 'Not publicly specified on website',
    comp1: comp1.target_customers || 'Not publicly specified on website',
    comp2: comp2.target_customers || 'Not publicly specified on website',
  };

  const executiveSummary = `${primary.company_name || 'Target company'} positions itself with a focus on ${primary.target_customers || 'its target market'}. Entry pricing observed is ${primaryEntry}. Compared to ${comp1.company_name || 'Competitor 1'} (${comp1Entry}) and ${comp2.company_name || 'Competitor 2'} (${comp2Entry}), key differentiators include ${primaryStrengths[0] || 'core software capabilities verified on public pages'}.`;

  return {
    executive_summary: executiveSummary,
    pricing_overview: {
      primary: { name: primary.company_name, entryPrice: primaryEntry, totalPlans: (primary.pricing || []).length },
      comp1: { name: comp1.company_name, entryPrice: comp1Entry, totalPlans: (comp1.pricing || []).length },
      comp2: { name: comp2.company_name, entryPrice: comp2Entry, totalPlans: (comp2.pricing || []).length },
    },
    feature_matrix: featureMatrix,
    target_comparison: targetComparison,
    primary_strengths: primaryStrengths,
    differentiators: [
      `${primary.company_name}: ${primaryStrengths[0] || 'Focuses on core developer/team experience'}`,
      `${comp1.company_name || 'Competitor 1'}: ${(comp1.features || [])[0] || 'Alternative market platform'}`,
      `${comp2.company_name || 'Competitor 2'}: ${(comp2.features || [])[0] || 'Alternative market platform'}`,
    ],
  };
}

/**
 * Runs competitive intelligence scan.
 * Never silently replaces failed live scans with mock results.
 * When forceMock is true, explicitly marks the snapshot as synthetic demo data.
 */
export async function runFullCompetitiveScan(targetUrl, { manualCompetitors = [], forceMock = false, onProgress = () => {} } = {}) {
  let domain = '';
  try {
    domain = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    domain = targetUrl.toLowerCase();
  }

  onProgress({ stage: 'init', message: `Initializing competitive scan for ${domain}...`, percent: 10 });

  // -------------------------------------------------------------------------
  // EXPLICIT DEMO / MOCK MODE PATH (Only taken when forceMock === true)
  // -------------------------------------------------------------------------
  if (forceMock) {
    onProgress({ stage: 'demo_match', message: `Generating explicit synthetic demo fixture for ${domain}...`, percent: 50 });
    const demo = DEMO_PRELOADS[domain] || {
      targetUrl,
      primaryCompany: {
        company_name: domain.split('.')[0].toUpperCase(),
        product_summary: `[DEMO FIXTURE] Synthetic intelligence profile for ${domain}.`,
        features: ['Cloud platform', 'API access', 'Team collaboration'],
        pricing: [{ plan_name: 'Standard', price: '$20', billing_cycle: 'monthly', details: 'Demo tier' }],
        target_customers: 'Software teams (Demo)',
        evidence_urls: [targetUrl],
        unknowns: ['Synthetic fixture: Not from live research'],
      },
      competitors: [
        {
          company_name: `${domain.split('.')[0]} Rival 1`,
          product_summary: 'Synthetic rival profile',
          features: ['Alternative workflows'],
          pricing: [{ plan_name: 'Standard', price: '$25', billing_cycle: 'monthly', details: 'Demo tier' }],
          target_customers: 'Software teams',
          evidence_urls: ['https://example.com/rival1'],
          unknowns: [],
        },
        {
          company_name: `${domain.split('.')[0]} Rival 2`,
          product_summary: 'Synthetic rival profile',
          features: ['Alternative workflows'],
          pricing: [{ plan_name: 'Standard', price: '$15', billing_cycle: 'monthly', details: 'Demo tier' }],
          target_customers: 'Software teams',
          evidence_urls: ['https://example.com/rival2'],
          unknowns: [],
        },
      ],
    };

    const comparison = generateComparisonMatrix(demo.primaryCompany, demo.competitors);
    const previousSnapshot = await getPreviousSnapshotForDomain(domain);

    const snapshotRecord = await saveSnapshot({
      targetUrl: demo.targetUrl,
      primaryCompany: demo.primaryCompany,
      competitors: demo.competitors,
      comparison,
      isDemo: true, // Explicitly tagged as synthetic demo fixture
    });

    const diff = previousSnapshot ? computeSnapshotDiff(previousSnapshot, snapshotRecord) : null;
    onProgress({ stage: 'done', message: 'Demo fixture loaded!', percent: 100 });

    return {
      snapshot: snapshotRecord,
      diff,
      isDemo: true,
    };
  }

  // -------------------------------------------------------------------------
  // GENUINE LIVE SCAN PATH (forceMock is false)
  // -------------------------------------------------------------------------
  if (!process.env.TINYFISH_API_KEY) {
    throw new Error('TINYFISH_API_KEY is not configured on the server. Set TINYFISH_API_KEY in server/.env or configure it via the Settings modal.');
  }

  // 1. Investigate primary company via TinyFish
  onProgress({ stage: 'primary_research', message: `Deploying TinyFish agent to research ${domain}...`, percent: 25 });
  const primaryResult = await investigateCompany(targetUrl);
  if (!primaryResult.success) {
    throw new Error(`Live TinyFish research on ${domain} failed: ${primaryResult.error}`);
  }
  const primaryData = primaryResult.data;

  // 2. Discover 2 Competitors
  onProgress({ stage: 'discovering_competitors', message: `Discovering 2 direct competitors for ${primaryData.company_name}...`, percent: 45 });
  let competitorList;
  if (manualCompetitors.length >= 2) {
    competitorList = manualCompetitors.map(url => ({ company_name: url, website_url: url }));
  } else {
    competitorList = await discoverCompetitors(primaryData.company_name, targetUrl, primaryData.product_summary, { forceMock: false });
  }

  // 3. Investigate Competitors with TinyFish
  const competitorDetails = [];
  let percentStep = 55;

  for (let i = 0; i < competitorList.length; i++) {
    const comp = competitorList[i];
    onProgress({
      stage: `investigating_competitor_${i + 1}`,
      message: `Deploying TinyFish agent to investigate competitor ${i + 1}/${competitorList.length}: ${comp.company_name || comp.website_url}...`,
      percent: percentStep,
    });
    percentStep += 20;

    if (comp.website_url && comp.website_url.startsWith('http')) {
      const compResult = await investigateCompany(comp.website_url);
      if (compResult.success) {
        competitorDetails.push(compResult.data);
      } else {
        // Record transparently that competitor research failed rather than inventing fake data
        competitorDetails.push({
          company_name: comp.company_name || `Competitor ${i + 1}`,
          product_summary: comp.reason || 'Identified direct competitor.',
          features: [],
          pricing: [],
          target_customers: 'Unknown (Live research could not extract target audience)',
          evidence_urls: [comp.website_url],
          unknowns: [`Live research on ${comp.website_url} failed: ${compResult.error}`],
        });
      }
    } else {
      competitorDetails.push({
        company_name: comp.company_name || `Competitor ${i + 1}`,
        product_summary: comp.reason || 'Direct competitor.',
        features: [],
        pricing: [],
        target_customers: 'Unknown',
        evidence_urls: [],
        unknowns: ['No valid website URL provided for competitor research'],
      });
    }
  }

  // 4. Synthesize comparison matrix
  onProgress({ stage: 'synthesizing', message: 'Synthesizing evidence-backed comparison matrix...', percent: 90 });
  const comparison = generateComparisonMatrix(primaryData, competitorDetails);

  // 5. Check previous snapshot & compute diff
  const previousSnapshot = await getPreviousSnapshotForDomain(domain);

  // 6. Save snapshot as verified live research
  const snapshotRecord = await saveSnapshot({
    targetUrl,
    primaryCompany: primaryData,
    competitors: competitorDetails,
    comparison,
    isDemo: false, // Verified genuine research
  });

  const diff = previousSnapshot ? computeSnapshotDiff(previousSnapshot, snapshotRecord) : null;
  onProgress({ stage: 'complete', message: 'Live competitive intelligence scan complete!', percent: 100 });

  return {
    snapshot: snapshotRecord,
    diff,
    isDemo: false,
  };
}
