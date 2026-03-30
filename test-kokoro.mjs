import { KokoroTTS } from "kokoro-js";
import fs from "fs";

async function test() {
    try {
        console.log("Loading Kokoro model...");
        const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
            dtype: "q8",
        });
        
        console.log("Synthesizing audio...");
        const audio = await tts.generate("Hello world, this is a test of Kokoro TTS running completely locally. The voice is surprisingly natural.", {
            voice: "af_heart",
        });
        
        audio.save("kokoro-test.wav");
        console.log("Saved kokoro-test.wav successfully.");
    } catch(e) {
        console.error("Kokoro JS Error:", e);
    }
}
test();
