const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';
const API_KEY = 'moltbook_sk_MYeSaAVI5dDc3Dc6or3LLiGU7oobGHh-';

async function main() {
  try {
    const res = await fetch(`${MOLTBOOK_API}/agents/status`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

main();
