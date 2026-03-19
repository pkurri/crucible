/**
 * 🔱 AAK NATION: THREADS EMPIRE UPLOADER
 * Posts native Threads posts for each topic series.
 *
 * SETUP (one-time):
 *   1. Use the same Meta Developer App as Instagram
 *   2. Add "Threads API" product to your app
 *   3. Get a Threads User Access Token
 *   4. Add to .env or GitHub secrets:
 *      THREADS_ACCESS_TOKEN=your_threads_user_token
 *      THREADS_USER_ID=your_threads_user_id
 *
 * Usage: node scripts/threads-uploader.mjs --topic SuccessCodes
 */

const THREADS_API = 'https://graph.threads.net/v1.0';

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// ═══════════════════════════════════════════════════════
// 📜 THREADS HOOKS — Conversational, native style
// ═══════════════════════════════════════════════════════
const THREADS_POSTS = {
  SuccessCodes:   '🔱 Did you know that every major civilization for 5,000 years had a "Success Protocol" before starting anything big?\n\nLord Ganesha was the original obstacle-removal framework.\n\nAncient wisdom. Modern execution. This is AAK Nation.\n\n#SuccessCodes #AAKNation',
  WealthWizards:  '💰 Honest question: Do you know what AI is doing to your savings right now?\n\nMost people don\'t. And that gap is going to cost them.\n\nFollow for daily wealth intelligence. #WealthWizards #AAKNation',
  MysteryArchive: '🔍 Some things get labeled "accident" when the data says otherwise.\n\nWe dig through the evidence so you don\'t have to.\n\nWhat case do you want us to decode next? 👇\n\n#MysteryArchive #AAKNation',
  PlayfulPixels:  '🌈 What if the most impactful thing you did for your child today was... press play?\n\nLearning designed to spark curiosity. Not just occupy time.\n\n#PlayfulPixels #AAKNation',
  ZenGarden:      '🧘 Reminder: You are allowed to pause.\n\nJust breathe. The algorithm can wait 60 seconds.\n\n#ZenGarden #AAKNation',
  FutureTech:     '⚡ The chip that will make cloud AI obsolete just entered mass production.\n\nYour phone in 2026 will run models that took $10M of compute to train.\n\nThis is not hype. This is a supply chain reality. #FutureTech #AAKNation',
  DailyStoic:     '⚔️ Ask yourself this morning:\n\n"What is in my control today?"\n\nWrite it down. Focus only on that.\n\nThat is the entire Stoic practice. Everything else is commentary. #DailyStoic #AAKNation',
  CookingCzar:    '🔬 The Maillard reaction at 154°C is the exact moment food stops being food and becomes flavor.\n\nMost people call it "browning."\n\nWe call it precision gastronomy. #CookingCzar #AAKNation',
  TravelTrek:     '🌏 There are places on this Earth that feel like glitches in the simulation.\n\nWe find them. We film them in 4K. We bring them to you.\n\nWhere do you want to go next? 👇 #TravelTrek #AAKNation',
  AutoArena:      '🏎️ The new electric hypercar does 0-100 in 1.8 seconds.\n\nLet that number sink in. 1.8 seconds.\n\nThe physics of speed have been completely rewritten. #AutoArena #AAKNation',
  GamingGuru:     '🎮 Every major game patch has a revenue strategy hidden inside it.\n\nWe decode the meta so you play smarter — in-game and in the market.\n\nWhat game do you want decoded next? 👇 #GamingGuru #AAKNation',
  NatureNook:     '🦋 Animals do not have anxiety about the future.\n\nThey are just... here. Present. Fully.\n\nMaybe that is the real intelligence we should be studying. #NatureNook #AAKNation',
  PulsePolitics:  '🌍 Three geopolitical events this week that the mainstream media buried.\n\nWe surface the signals you actually need to know about.\n\nFollow for the global intelligence briefing. #PulsePolitics #AAKNation',
  CinemaScope:    '🎬 Every single Pixar film follows the same 12-beat narrative structure.\n\nOnce you see it, every movie changes.\n\nWant me to break it down? 👇 #CinemaScope #AAKNation',
  LifeHacks:      '🧬 Your peak cognitive performance window is 90-120 minutes after waking.\n\nMost people waste it on email and social media.\n\nWhat do YOU do in your first 2 hours? 👇 #LifeHacks #AAKNation',
  MindfulMinutes: '🧠 One thing: Put your phone down for the next 60 seconds.\n\nJust breathe. Slowly.\n\nI\'ll be here when you get back. ✌️ #MindfulMinutes #AAKNation',
  GadgetGrab:     '🔩 We tore apart a $1,200 smartphone last night.\n\nThe actual BOM (bill of materials) cost? $287.\n\nThe hardware margin game is wild. #GadgetGrab #AAKNation',
  PetParade:      '🐾 Your pet looks at you like you are the entire world.\n\nBecause to them, you are.\n\nGo home and give them a hug today. 🥺 #PetParade #AAKNation',
  HistoryHub:     '📜 Every empire that ever fell did three things in its final decades:\n\n1. Debased its currency\n2. Overextended its military\n3. Stopped investing in its youth\n\nAny of that sound familiar? #HistoryHub #AAKNation',
  ForgeCore:      '⚙️ We built an automated media empire using:\n- AI content generation\n- Free TTS voiceover\n- FFmpeg 4K rendering\n- GitHub Actions deployment\n\nZero human intervention after setup.\n\nThis is the Crucible. #ForgeCore #AAKNation',
};

// ═══════════════════════════════════════════════════════
// 🔧 THREADS API HELPER
// ═══════════════════════════════════════════════════════
async function apiCall(url, method = 'GET', body = null) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const json = await res.json();
  if (json.error) throw new Error(`Threads API: ${json.error.message}`);
  return json;
}

async function postToThreads(text, videoUrl = null) {
  const userId = process.env.THREADS_USER_ID;
  const token = process.env.THREADS_ACCESS_TOKEN;

  // Step 1: Create container
  const containerPayload = { text, access_token: token };
  if (videoUrl) {
    containerPayload.media_type = 'VIDEO';
    containerPayload.video_url = videoUrl;
  } else {
    containerPayload.media_type = 'TEXT';
  }

  console.log('[Threads] Creating container...');
  const container = await apiCall(
    `${THREADS_API}/${userId}/threads`,
    'POST',
    containerPayload
  );

  // Step 2: Publish
  console.log(`[Threads] Publishing container: ${container.id}...`);
  const publish = await apiCall(
    `${THREADS_API}/${userId}/threads_publish`,
    'POST',
    { creation_id: container.id, access_token: token }
  );

  return publish.id;
}

// ═══════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════
async function uploadToThreads() {
  const topicName = getArg('--topic');
  if (!topicName) { console.error('Usage: node threads-uploader.mjs --topic <Topic>'); process.exit(1); }

  if (!process.env.THREADS_ACCESS_TOKEN || !process.env.THREADS_USER_ID) {
    console.error('❌ Missing THREADS_ACCESS_TOKEN or THREADS_USER_ID.');
    console.error('   See setup instructions at the top of this file.');
    process.exit(1);
  }

  const text = THREADS_POSTS[topicName];
  if (!text) { console.error(`❌ No Threads post for topic: ${topicName}`); process.exit(1); }

  console.log(`\n[AAK Nation] Threads Upload: ${topicName}`);
  console.log('='.repeat(50));

  try {
    const postId = await postToThreads(text);
    console.log(`[OK] Threads post live! ID: ${postId}`);
  } catch (e) {
    console.error(`[FAIL] Threads: ${e.message}`);
  }
}

uploadToThreads();
