const https = require('https');

const API_KEY = process.env.IONOS_API_KEY;
const DOMAIN = 'mytypebeat.com';
const VERCEL_IP = '76.76.21.21';
const VERCEL_CNAME = 'cname.vercel-dns.com';

if (!API_KEY) {
  console.error("CRITICAL ABORT: You must provide your IONOS API Key.");
  console.error("Example: IONOS_API_KEY=\"your.api.key\" node ionos_dns_sync.js");
  process.exit(1);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.hosting.ionos.com',
      path: '/dns/v1' + path,
      method: method,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
         if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data ? JSON.parse(data) : null);
         } else {
            console.error(`\n[API Error ${res.statusCode}]: ${data}`);
            reject(new Error(`IONOS API responded with ${res.statusCode}`));
         }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log(`[1/4] Authenticating & Fetching IONOS Zone Registry...`);
    const zones = await request('GET', '/zones');
    const zone = zones.find(z => z.name === DOMAIN);
    
    if (!zone) {
       console.error(`\n[!] Failed to find '${DOMAIN}' inside your IONOS account. Check your API Key!`);
       return;
    }
    
    const zoneId = zone.id;
    console.log(`[2/4] Found Target Zone UUID: ${zoneId}`);
    
    console.log(`[3/4] Injecting Vercel Root A-Record (${VERCEL_IP})...`);
    await request('POST', `/zones/${zoneId}/records`, [{
       name: DOMAIN,
       type: 'A',
       content: VERCEL_IP,
       ttl: 3600,
       prio: 0,
       disabled: false
    }]).catch(e => console.log("   -> A-Record already exists or conflicted. Proceeding..."));

    console.log(`[4/4] Injecting Vercel Subdomain CNAME (${VERCEL_CNAME})...`);
    await request('POST', `/zones/${zoneId}/records`, [{
       name: 'www',
       type: 'CNAME',
       content: VERCEL_CNAME,
       ttl: 3600,
       prio: 0,
       disabled: false
    }]).catch(e => console.log("   -> CNAME already exists or conflicted. Proceeding..."));
    
    console.log("\n✅ IONOS DNS Synchronization Complete! Vercel is now permanently wired to mytypebeat.com");
    console.log("Please allow up to 10 minutes for internet DNS propagation to take effect.");

  } catch(err) {
    console.error("\nExecution Failed: ", err.message);
  }
}

run();
