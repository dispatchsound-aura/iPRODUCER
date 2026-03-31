const { Client } = require('pg');

const project = 'ubjmtmrvvbrvpuaaawmm';
const password = 'Darksaver88!';
const regions = [
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-us-east-2',
  'aws-0-eu-west-1',
  'aws-0-eu-central-1',
  'aws-0-eu-west-2',
  'aws-0-ap-northeast-1',
  'aws-0-ap-southeast-1',
  'aws-0-ap-southeast-2',
  'aws-0-ca-central-1',
  'aws-0-sa-east-1'
];

async function testAll() {
  for (const region of regions) {
    const poolerUrl = `postgresql://postgres.${project}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:6543/postgres`;
    console.log(`Testing ${region}...`);
    const client = new Client({ connectionString: poolerUrl, connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      console.log(`SUCCESS! Pooler found at: ${region}`);
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`Failed ${region}`);
    }
  }
  console.log("None succeeded.");
}

testAll();
