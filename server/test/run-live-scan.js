import 'dotenv/config';
import { runFullCompetitiveScan } from '../src/services/analysis.js';

async function main() {
  console.log('Starting full LIVE competitive scan for https://resend.com...');
  const start = Date.now();
  
  try {
    const res = await runFullCompetitiveScan('https://resend.com', {
      forceMock: false,
      onProgress: (p) => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[${elapsed}s] [${p.percent}%] ${p.message}`);
      },
    });

    console.log('\n=== FULL LIVE SCAN COMPLETED SUCCESSFULLY ===');
    console.log('Total Elapsed:', ((Date.now() - start) / 1000).toFixed(1), 's');
    console.log('Snapshot ID:', res.snapshot.id);
    console.log('isDemo:', res.snapshot.isDemo);
    console.log('Primary Company:', res.snapshot.primaryCompany.company_name);
    console.log('Product Summary:', res.snapshot.primaryCompany.product_summary?.slice(0, 120) + '...');
    console.log('Primary Features Count:', res.snapshot.primaryCompany.features?.length);
    console.log('Primary Pricing Tiers:', res.snapshot.primaryCompany.pricing?.map(p => `${p.plan_name}: ${p.price}`).join(', '));
    console.log('Primary Evidence URLs:', res.snapshot.primaryCompany.evidence_urls);
    console.log('Primary Unknowns:', res.snapshot.primaryCompany.unknowns);
    console.log('\nDiscovered Competitors:');
    res.snapshot.competitors.forEach((c, i) => {
      console.log(`Competitor ${i + 1}: ${c.company_name}`);
      console.log(`  Features: ${c.features?.length || 0}`);
      console.log(`  Pricing Tiers: ${c.pricing?.length || 0}`);
      console.log(`  Evidence URLs:`, c.evidence_urls);
      console.log(`  Unknowns:`, c.unknowns);
    });
    console.log('\nExecutive Summary:');
    console.log(res.snapshot.comparison?.executive_summary);
  } catch (err) {
    console.error('\n=== LIVE SCAN FAILED ===');
    console.error('Error message:', err.message);
  }
}

main();
