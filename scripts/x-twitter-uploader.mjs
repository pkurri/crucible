import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 🔱 AAK NATION: X (TWITTER) EMPIRE UPLOADER
 * Posts a video + 5-tweet thread to X automatically.
 *
 * SETUP (one-time):
 *   1. Go to https://developer.twitter.com → Create Project + App
 *   2. Enable "Read and Write" permissions
 *   3. Generate Access Token + Secret (User Auth)
 *   4. Add to .env or GitHub secrets:
 *      X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 *
 * Usage: node scripts/x-twitter-uploader.mjs --topic SuccessCodes
 */

const BASE = path.join(process.cwd(), 'data', 'youtube-empire', 'AAK-Nation', 'topics');

const getArg = (key) => {
  const idx = process.argv.indexOf(key);
  return idx !== -1 ? process.argv[idx + 1] : null;
};

// ═══════════════════════════════════════════════════════
// 📜 THREAD DATABASE — 5-tweet viral threads per topic
// ═══════════════════════════════════════════════════════
const THREADS = {
  SuccessCodes: [
    '🔱 Lord Ganesha is not just a deity. He is the universal protocol for removing every obstacle in your path. A thread on Ancient Success Codes (1/5)',
    '📜 For 5,000 years, civilizations used Ganesha as a mental framework before starting ANY major endeavor. This is psychological priming at its peak. (2/5)',
    '🧠 Modern neuroscience confirms it: ritual and intention-setting before a task activates the prefrontal cortex. The ancients knew this. (3/5)',
    '⚡ Your "Success Code" today: Write down ONE obstacle in your path. Then write down THREE ways to remove it. That is the Ganesha protocol. (4/5)',
    '🔱 Follow @AAKNation for daily Success Codes that combine ancient wisdom with modern execution strategies. This is AAK Nation. Reply with YOUR biggest obstacle. (5/5) #SuccessCodes #AAKNation',
  ],
  WealthWizards: [
    '💰 AI is rewriting the rules of finance. Here are 5 things wealthy people understand that nobody is teaching you. (Thread 1/5)',
    '1. AI trading algorithms now execute 73% of all Wall Street transactions. If you are not using AI tools for your portfolio, you are already behind. (2/5)',
    '2. The next wealth transfer will not be through real estate. It will be through AI-generated intellectual property and digital asset royalties. (3/5)',
    '3. The wealthiest people protect capital first, grow second. They use tax-efficient wrappers that most people do not even know exist. (4/5)',
    '🤖 Follow @AAKNation for AI-powered wealth strategies that used to be reserved for the ultra-rich. This is WealthWizards. #WealthWizards #Finance #AI #AAKNation (5/5)',
  ],
  FutureTech: [
    '⚡ This semiconductor breakthrough changes EVERYTHING. Most people will not understand its implications for 5 more years. You are early. (Thread 1/5)',
    '🔬 The new 2nm chip process allows 50 billion transistors on a surface smaller than a fingernail. To put that in perspective — that is more neurons than a mouse brain. (2/5)',
    '🤖 What this means: consumer AI will no longer require cloud compute. Your phone will run GPT-level models locally by 2026. Privacy-first AI is coming. (3/5)',
    '💰 Investment signal: Companies building on-device AI stacks (not cloud dependency) will define the next decade of tech. This is the early signal. (4/5)',
    '🔱 Follow @AAKNation for Silicon Valley-level hardware analysis without the paywall. FutureTech series drops daily. Reply with the tech you want decoded. #FutureTech #AAKNation (5/5)',
  ],
  DailyStoic: [
    '⚔️ Marcus Aurelius ran the most powerful empire in the world. He wrote in his private journal every night. Here is what he actually believed. (Thread 1/5)',
    '"You have power over your mind, not outside events. Realize this and you will find strength." — He was dealing with plagues, wars, and betrayal when he wrote this. (2/5)',
    '🧠 The Stoic daily practice: Morning — set intention. Evening — audit your actions. No self-punishment. Only recalibration. 5 minutes. That is it. (3/5)',
    '💎 Modern application: Every time you feel anxiety, ask: "Is this in my control?" If yes — act. If no — release. This single filter eliminates 80% of stress. (4/5)',
    '🔱 Follow @AAKNation for daily Stoic protocols adapted for 2025 life. Not philosophy lectures. Actionable mental frameworks. Reply: What stresses you most? #DailyStoic #AAKNation (5/5)',
  ],
  MysteryArchive: [
    '🔍 This industrial cold case has never been officially solved. But the data points to something the report deliberately left out. (Thread 1/5)',
    '📂 The official report cited "mechanical failure." But 3 independent engineers who analyzed the data found something that contradicts this entirely. (2/5)',
    '🧩 The timeline inconsistency: the event was logged 4 minutes before the alarm triggered. That gap has never been explained publicly. (3/5)',
    '📡 The data trail: recovered sensor logs show an external variable that was redacted from the public release. This is not conspiracy — it is documentation. (4/5)',
    '🔱 Follow @AAKNation for deep dives into unsolved industrial and tech cold cases. MysteryArchive — where data meets truth. Reply with a case you want decoded. #MysteryArchive #AAKNation (5/5)',
  ],
  ZenGarden:      { tweets: ['🧘 60 seconds of this will reset your entire nervous system. Science-backed. No app required. (1/5)', 'Your vagus nerve controls 80% of your stress response. Slow, deep breaths activate it and literally switch your body from fight-or-flight to rest-and-digest. (2/5)', '⏱️ The 4-7-8 method: Inhale for 4 counts. Hold for 7. Exhale for 8. Do this twice and your heart rate will drop measurably. (3/5)', '🎵 Ambient sound frequencies between 40-60Hz have been shown to increase theta brainwave activity — the same state as light meditation. This is the science behind our ZenGarden series. (4/5)', '🔱 Follow @AAKNation for daily 60-second resets. Science + sound + space. ZenGarden series. Reply: What time of day do you feel most stressed? #ZenGarden #AAKNation (5/5)'] },
};

// ═══════════════════════════════════════════════════════
// 🔧 POST TWEET HELPER (using twitter-api-v2)
// ═══════════════════════════════════════════════════════
async function postThread(tweets) {
  let { TwitterApi } = await import('twitter-api-v2').catch(() => {
    console.error('Run: npm install twitter-api-v2');
    process.exit(1);
  });

  const client = new TwitterApi({
    appKey:         process.env.X_API_KEY,
    appSecret:      process.env.X_API_SECRET,
    accessToken:    process.env.X_ACCESS_TOKEN,
    accessSecret:   process.env.X_ACCESS_SECRET,
  }).readWrite;

  let lastId = null;
  for (const [i, text] of tweets.entries()) {
    const params = { text };
    if (lastId) params.reply = { in_reply_to_tweet_id: lastId };
    const result = await client.v2.tweet(params);
    lastId = result.data.id;
    console.log(`[X] Tweet ${i + 1}/${tweets.length} posted: ${lastId}`);
    await new Promise(r => setTimeout(r, 2000)); // Small delay between tweets
  }
  return lastId;
}

// ═══════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════
async function uploadToX() {
  const topicName = getArg('--topic');
  if (!topicName) { console.error('Usage: node x-twitter-uploader.mjs --topic <Topic>'); process.exit(1); }

  if (!process.env.X_API_KEY) {
    console.error('❌ Missing X API credentials. Add X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET to your .env');
    process.exit(1);
  }

  const threadData = THREADS[topicName];
  const tweets = Array.isArray(threadData) ? threadData : threadData?.tweets;

  if (!tweets) {
    console.error(`❌ No thread script for topic: ${topicName}`);
    process.exit(1);
  }

  console.log(`\n[AAK Nation] X Thread Upload: ${topicName}`);
  console.log('='.repeat(50));

  try {
    const finalTweetId = await postThread(tweets);
    console.log(`[OK] Thread posted! Final tweet ID: ${finalTweetId}`);
  } catch (e) {
    console.error(`[FAIL] X Upload: ${e.message}`);
  }
}

uploadToX();
