import 'dotenv/config';
const META_API = 'https://graph.facebook.com/v19.0';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const IG_ACCOUNT_ID = process.env.META_IG_ACCOUNT_ID;

async function checkIG() {
    if (!ACCESS_TOKEN || !IG_ACCOUNT_ID) {
        console.error('❌ Missing credentials.');
        return;
    }
    try {
        const res = await fetch(`${META_API}/${IG_ACCOUNT_ID}?fields=username,name&access_token=${ACCESS_TOKEN}`);
        const json = await res.json();
        console.log('--- IG Account Status ---');
        console.log(JSON.stringify(json, null, 2));
        if (json.error) {
            console.error('❌ Meta API Error:', json.error.message);
        } else {
            console.log('✅ Connection Successful!');
        }
    } catch (e) {
        console.error('❌ Fetch Error:', e.message);
    }
}

checkIG();
