const { EdgeTTS } = require('edge-tts');

async function test() {
  try {
    const tts = new EdgeTTS({ voice: 'en-US-GuyNeural' });
    await tts.ttsPromise('This is a test to verify the npm version of Edge TTS.', 'test.mp3');
    console.log('✅ Generated successfully with edge-tts node module.');
  } catch (e) {
    console.error('❌ Failed:', e.message);
  }
}

test();
