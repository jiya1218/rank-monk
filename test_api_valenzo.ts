import dotenv from 'dotenv';
import fs from 'fs';
import { GET } from './app/api/eeat-analysis/route';
import { NextRequest } from 'next/server';

// Load .env
const env = dotenv.parse(fs.readFileSync('.env'));
for (const [k, v] of Object.entries(env)) {
  process.env[k] = v;
}

async function testDirectApi() {
  console.log('Testing GET with url=valenzo.in...');
  const req = new NextRequest('http://localhost:3000/api/eeat-analysis?url=valenzo.in');
  const res = await GET(req);
  const json = await res.json();

  console.log('--- API RESULT FOR valenzo.in ---');
  console.log('Status:', res.status);
  console.log('Domain:', json.domain);
  console.log('Site Type:', json.siteType, '| Label:', json.siteTypeLabel);
  console.log('Industry:', json.industryCategory);
  console.log('Business Summary:', json.businessSummary);
  console.log('Overall Score:', json.overallScore, '| Grade:', json.grade, '| Tier:', json.qualityTier);
  console.log('Scores:', json.scores);
  console.log('Why this score:', json.whyThisScore);
  console.log('Priority Remediations count:', json.remediationSteps?.length);
  console.log('Priority Remediations (first 2):', json.remediationSteps?.slice(0, 2));
  console.log('Technical Checklist length:', json.technicalChecklist?.length);
  console.log('First 3 Technical Checklist items:', json.technicalChecklist?.slice(0, 3));
}

testDirectApi().catch(console.error);

