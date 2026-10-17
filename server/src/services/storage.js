import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SNAPSHOTS_DIR = path.resolve(__dirname, '../../data/snapshots');

/**
 * Ensures the snapshots directory exists.
 */
async function ensureDir() {
  try {
    await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create snapshots directory:', err);
  }
}

/**
 * Generates a clean URL slug / domain for identification.
 */
export function extractDomain(url) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase();
  }
}

/**
 * Saves a research snapshot to disk.
 */
export async function saveSnapshot(snapshotData) {
  await ensureDir();
  const id = snapshotData.id || `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = snapshotData.timestamp || new Date().toISOString();
  
  const record = {
    ...snapshotData,
    id,
    timestamp,
    targetDomain: extractDomain(snapshotData.targetUrl || ''),
  };

  const filePath = path.join(SNAPSHOTS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(record, null, 2), 'utf-8');
  return record;
}

/**
 * Lists all stored snapshots, newest first.
 */
export async function listSnapshots() {
  await ensureDir();
  try {
    const files = await fs.readdir(SNAPSHOTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const items = [];
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(SNAPSHOTS_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        items.push({
          id: data.id,
          targetUrl: data.targetUrl,
          targetDomain: data.targetDomain || extractDomain(data.targetUrl || ''),
          companyName: data.primaryCompany?.company_name || data.targetDomain || 'Unknown',
          competitorNames: (data.competitors || []).map(c => c.company_name || c.domain),
          timestamp: data.timestamp,
          summary: data.comparison?.executive_summary || data.primaryCompany?.product_summary || '',
          isDemo: Boolean(data.isDemo),
        });
      } catch (e) {
        console.warn(`Failed to parse snapshot file ${file}:`, e.message);
      }
    }

    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (err) {
    console.error('Error listing snapshots:', err);
    return [];
  }
}

/**
 * Gets a snapshot by ID.
 */
export async function getSnapshotById(id) {
  await ensureDir();
  const safeId = path.basename(id);
  const filePath = path.join(SNAPSHOTS_DIR, `${safeId}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Finds the latest previous snapshot for the same domain (excluding current snapshot ID if provided).
 */
export async function getPreviousSnapshotForDomain(domain, excludeId = null) {
  const all = await listSnapshots();
  const matches = all.filter(s => s.targetDomain === domain && s.id !== excludeId);
  if (matches.length === 0) return null;
  return await getSnapshotById(matches[0].id);
}

/**
 * Computes deep differences between two snapshots for change detection.
 * Enforces strict guards so missing data is never classified as removed features or price changes,
 * and explicitly marks synthetic demo data so it cannot be presented as real historical observation.
 */
export function computeSnapshotDiff(oldSnap, newSnap) {
  if (!oldSnap || !newSnap) return null;

  const isDemoComparison = Boolean(oldSnap.isDemo || newSnap.isDemo);

  const oldCompany = oldSnap.primaryCompany || {};
  const newCompany = newSnap.primaryCompany || {};

  // Check data availability for features
  const oldFeaturesList = Array.isArray(oldCompany.features) ? oldCompany.features : [];
  const newFeaturesList = Array.isArray(newCompany.features) ? newCompany.features : [];

  const featuresAvailableInBoth = oldFeaturesList.length > 0 && newFeaturesList.length > 0;
  
  let addedFeatures = [];
  let removedFeatures = [];
  let featuresNotice = null;

  if (featuresAvailableInBoth) {
    const oldFeatures = new Set(oldFeaturesList.map(f => f.toLowerCase().trim()));
    const newFeatures = new Set(newFeaturesList.map(f => f.toLowerCase().trim()));

    addedFeatures = newFeaturesList.filter(f => !oldFeatures.has(f.toLowerCase().trim()));
    removedFeatures = oldFeaturesList.filter(f => !newFeatures.has(f.toLowerCase().trim()));
  } else if (oldFeaturesList.length === 0 && newFeaturesList.length > 0) {
    featuresNotice = 'Features were not recorded in previous scan; current features are newly observed.';
  } else if (oldFeaturesList.length > 0 && newFeaturesList.length === 0) {
    featuresNotice = 'Feature details were unavailable in current scan; features cannot be verified as removed.';
  }

  // Check data availability for pricing
  const oldPlansList = Array.isArray(oldCompany.pricing) ? oldCompany.pricing : [];
  const newPlansList = Array.isArray(newCompany.pricing) ? newCompany.pricing : [];

  const pricingAvailableInBoth = oldPlansList.length > 0 && newPlansList.length > 0;

  let addedPlans = [];
  let removedPlans = [];
  let modifiedPlans = [];
  let pricingNotice = null;

  if (pricingAvailableInBoth) {
    const oldPlanMap = new Map(oldPlansList.map(p => [p.plan_name?.toLowerCase().trim(), p]));
    const newPlanMap = new Map(newPlansList.map(p => [p.plan_name?.toLowerCase().trim(), p]));

    addedPlans = newPlansList.filter(p => p.plan_name && !oldPlanMap.has(p.plan_name?.toLowerCase().trim()));
    removedPlans = oldPlansList.filter(p => p.plan_name && !newPlanMap.has(p.plan_name?.toLowerCase().trim()));

    for (const [name, newPlan] of newPlanMap.entries()) {
      if (oldPlanMap.has(name)) {
        const oldPlan = oldPlanMap.get(name);
        const oldPrice = oldPlan.price?.trim();
        const newPrice = newPlan.price?.trim();
        if (oldPrice && newPrice && (oldPrice !== newPrice || oldPlan.billing_cycle !== newPlan.billing_cycle)) {
          modifiedPlans.push({
            plan_name: newPlan.plan_name,
            oldPrice: oldPlan.price,
            newPrice: newPlan.price,
            oldCycle: oldPlan.billing_cycle || 'N/A',
            newCycle: newPlan.billing_cycle || 'N/A',
          });
        }
      }
    }
  } else if (oldPlansList.length === 0 && newPlansList.length > 0) {
    pricingNotice = 'Pricing was unavailable in previous scan; current tiers are newly observed, not newly launched.';
  } else if (oldPlansList.length > 0 && newPlansList.length === 0) {
    pricingNotice = 'Pricing was unavailable or could not be verified in current scan; previous plans are not classified as discontinued.';
  }

  // Target audience shift: only if both are non-empty and differ
  const oldTarget = (oldCompany.target_customers || '').trim();
  const newTarget = (newCompany.target_customers || '').trim();

  const isUnknown = (str) =>
    !str ||
    str.toLowerCase().includes('unknown') ||
    str.toLowerCase().includes('not specified') ||
    str.toLowerCase().includes('not explicitly');

  let targetAudienceShift = null;
  if (!isUnknown(oldTarget) && !isUnknown(newTarget) && oldTarget.toLowerCase() !== newTarget.toLowerCase()) {
    targetAudienceShift = {
      before: oldTarget,
      after: newTarget,
    };
  }

  const daysBetween = Math.round(
    Math.abs(new Date(newSnap.timestamp) - new Date(oldSnap.timestamp)) / (1000 * 60 * 60 * 24)
  );

  const changesDetected =
    addedFeatures.length > 0 ||
    removedFeatures.length > 0 ||
    addedPlans.length > 0 ||
    removedPlans.length > 0 ||
    modifiedPlans.length > 0 ||
    !!targetAudienceShift;

  return {
    previousSnapshotId: oldSnap.id,
    previousTimestamp: oldSnap.timestamp,
    currentSnapshotId: newSnap.id,
    currentTimestamp: newSnap.timestamp,
    daysBetween,
    isDemoComparison,
    demoNotice: isDemoComparison
      ? 'Notice: This comparison involves synthetic demo data and cannot be presented as a real historical observation.'
      : null,
    changesDetected,
    features: {
      added: addedFeatures,
      removed: removedFeatures,
      notice: featuresNotice,
    },
    pricing: {
      addedPlans,
      removedPlans,
      modifiedPlans,
      notice: pricingNotice,
    },
    targetAudienceShift,
  };
}
