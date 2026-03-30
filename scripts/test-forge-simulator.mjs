import { runForge } from '../skills/forge-simulator/scripts/run-simulation.mjs';

/**
 * 🧪 Test Forge Simulator
 * 
 * Verifies the multi-application nature of the skill by running a fast
 * simulation with 2 agents and 3 rounds.
 */

async function test() {
  console.log('🧪 Starting Forge Simulator verification...\n');

  try {
    // 1. Test Market Domain
    console.log('--- Test Case 1: Market Decision ---');
    await runForge({
      domain: 'market',
      ore: 'Our SaaS competitor just doubled their prices.',
      question: 'Will our churn increase or decrease if we stay at current price?',
      rounds: 2,
      agentCounts: { customer_price: 1, competitor: 1 } // Small scale for fast test
    });

    console.log('\n--- Test Case 2: Engineering Decision ---');
    // 2. Test Engineering Domain
    await runForge({
      domain: 'engineering',
      ore: 'Moving from Next.js Pages router to App router.',
      question: 'What is the biggest risk to our velocity in the first 2 weeks?',
      rounds: 2,
      agentCounts: { senior_dev: 1, product_manager: 1 }
    });

    console.log('\n✅ Verification complete. All domains working.');
  } catch (err) {
    console.error('\n❌ Verification failed:', err.message);
    if (err.message.includes('GEMINI_API_KEY')) {
      console.log('   (Tip: Ensure GEMINI_API_KEY and OPENROUTER_API_KEY are set in .env)');
    }
  }
}

test();
