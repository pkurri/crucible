/**
 * 🔮 CONSENSUS ENGINE — God View Extension for Forge Simulator
 *
 * Tracks agent positions over time and detects consensus emergence.
 *
 * Metrics computed per round:
 *   - Vote distribution (agree / disagree / uncertain)
 *   - Velocity (% of agents who changed position)
 *   - Shannon entropy (lower = more consensus)
 *   - Cluster detection (opinion factions)
 *
 * Consensus is detected when:
 *   - >70% agents aligned in one direction
 *   - Velocity < 5% change/round (positions stabilizing)
 */

// ─────────────────────────────────────────────────────────────────────────
// Position Classification
// ─────────────────────────────────────────────────────────────────────────

/**
 * Classify an agent's opinion shift text into a discrete position.
 * @param {string} opinionShift - e.g. "more positive", "unchanged", "more negative"
 * @param {string} currentPosition - Current position ('agree'|'disagree'|'uncertain')
 * @returns {string} - 'agree' | 'disagree' | 'uncertain'
 */
export function classifyPosition(opinionShift, currentPosition = 'uncertain') {
  const shift = (opinionShift || '').toLowerCase();

  if (shift.includes('positive') || shift.includes('agree') || shift.includes('bullish') || shift.includes('support')) {
    if (currentPosition === 'uncertain') return 'agree';
    if (currentPosition === 'disagree') return 'uncertain'; // Softening, not full flip
    return 'agree';
  }

  if (shift.includes('negative') || shift.includes('disagree') || shift.includes('bearish') || shift.includes('oppose')) {
    if (currentPosition === 'uncertain') return 'disagree';
    if (currentPosition === 'agree') return 'uncertain'; // Softening, not full flip
    return 'disagree';
  }

  return currentPosition; // No change
}

/**
 * Map initial opinion text to a starting position.
 * @param {string} initialOpinion
 * @returns {string} - 'agree' | 'disagree' | 'uncertain'
 */
export function classifyInitialPosition(initialOpinion) {
  if (!initialOpinion) return 'uncertain';
  const lower = initialOpinion.toLowerCase();

  const positiveSignals = ['positive', 'optimistic', 'bullish', 'support', 'favor', 'agree', 'yes', 'good', 'strong'];
  const negativeSignals = ['negative', 'pessimistic', 'bearish', 'oppose', 'against', 'disagree', 'no', 'bad', 'weak', 'skeptic'];

  if (positiveSignals.some(s => lower.includes(s))) return 'agree';
  if (negativeSignals.some(s => lower.includes(s))) return 'disagree';
  return 'uncertain';
}


// ─────────────────────────────────────────────────────────────────────────
// Confidence Scoring
// ─────────────────────────────────────────────────────────────────────────

/**
 * Compute a confidence score based on position stability.
 * Agents who have held the same position longer have higher confidence.
 * @param {Array} positionHistory - Array of {round, position}
 * @returns {number} - 0 to 100
 */
export function computeConfidence(positionHistory) {
  if (!positionHistory || positionHistory.length === 0) return 50;

  // Count consecutive rounds with same position (from most recent)
  const current = positionHistory[positionHistory.length - 1].position;
  let streak = 0;
  for (let i = positionHistory.length - 1; i >= 0; i--) {
    if (positionHistory[i].position === current) streak++;
    else break;
  }

  // Base confidence from streak length (max at 10 rounds)
  const streakConfidence = Math.min(streak / 10, 1) * 60;

  // Bonus for never changing position
  const neverChanged = positionHistory.every(p => p.position === current);
  const stabilityBonus = neverChanged ? 20 : 0;

  // Base 20 for having a non-uncertain position
  const positionBonus = current !== 'uncertain' ? 20 : 0;

  return Math.min(Math.round(streakConfidence + stabilityBonus + positionBonus), 100);
}


// ─────────────────────────────────────────────────────────────────────────
// Shannon Entropy
// ─────────────────────────────────────────────────────────────────────────

/**
 * Compute Shannon entropy of position distribution.
 * Lower entropy = more consensus. Max entropy (3 categories) ≈ 1.585.
 * @param {{ agree: number, disagree: number, uncertain: number }} distribution
 * @returns {number} - Entropy value (0 to ~1.585)
 */
export function computeEntropy(distribution) {
  const total = distribution.agree + distribution.disagree + distribution.uncertain;
  if (total === 0) return 0;

  let entropy = 0;
  for (const key of ['agree', 'disagree', 'uncertain']) {
    const p = distribution[key] / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return Math.round(entropy * 1000) / 1000;
}


// ─────────────────────────────────────────────────────────────────────────
// Cluster Detection
// ─────────────────────────────────────────────────────────────────────────

/**
 * Detect opinion clusters among agents.
 * Groups agents by position and identifies faction strength.
 * @param {Array} agents - Agents with .godView.position
 * @returns {Array} - Clusters: [{ position, count, percentage, members, avgConfidence }]
 */
export function detectClusters(agents) {
  const clusters = {};

  for (const agent of agents) {
    const pos = agent.godView?.position || 'uncertain';
    if (!clusters[pos]) {
      clusters[pos] = { position: pos, count: 0, members: [], totalConfidence: 0 };
    }
    clusters[pos].count++;
    clusters[pos].members.push(agent.id);
    clusters[pos].totalConfidence += agent.godView?.confidence || 50;
  }

  const total = agents.length;
  return Object.values(clusters)
    .map(c => ({
      position: c.position,
      count: c.count,
      percentage: Math.round((c.count / total) * 100),
      members: c.members,
      avgConfidence: Math.round(c.totalConfidence / c.count)
    }))
    .sort((a, b) => b.count - a.count);
}


// ─────────────────────────────────────────────────────────────────────────
// Round Analysis
// ─────────────────────────────────────────────────────────────────────────

/**
 * Analyze a single round's results and return a ConsensusSnapshot.
 * @param {Array} agents - Agents with .godView state
 * @param {number} round - Current round number
 * @param {object} prevSnapshot - Previous round's snapshot (or null)
 * @returns {object} - ConsensusSnapshot
 */
export function analyzeRound(agents, round, prevSnapshot = null) {
  const distribution = { agree: 0, disagree: 0, uncertain: 0 };

  for (const agent of agents) {
    const pos = agent.godView?.position || 'uncertain';
    distribution[pos]++;
  }

  // Compute velocity: % of agents who changed position since last round
  let velocity = 0;
  if (prevSnapshot) {
    let changed = 0;
    for (const agent of agents) {
      const prevPos = prevSnapshot._agentPositions?.[agent.id];
      const currPos = agent.godView?.position || 'uncertain';
      if (prevPos && prevPos !== currPos) changed++;
    }
    velocity = Math.round((changed / agents.length) * 100);
  }

  // Store current positions for next round's velocity calc
  const agentPositions = {};
  for (const agent of agents) {
    agentPositions[agent.id] = agent.godView?.position || 'uncertain';
  }

  const entropy = computeEntropy(distribution);
  const clusters = detectClusters(agents);

  return {
    round,
    distribution,
    velocity,
    entropy,
    clusters,
    _agentPositions: agentPositions
  };
}


// ─────────────────────────────────────────────────────────────────────────
// Consensus Detection
// ─────────────────────────────────────────────────────────────────────────

const CONSENSUS_THRESHOLD = 0.70;    // 70% must align
const VELOCITY_THRESHOLD = 5;        // < 5% change per round
const MIN_STABLE_ROUNDS = 3;         // Must be stable for 3+ rounds

/**
 * Check if consensus has been reached based on snapshot history.
 * @param {Array} history - Array of ConsensusSnapshot
 * @returns {object|null} - ConsensusSignal or null
 */
export function detectConsensus(history) {
  if (history.length < MIN_STABLE_ROUNDS) return null;

  const recent = history.slice(-MIN_STABLE_ROUNDS);
  const latest = recent[recent.length - 1];
  const total = latest.distribution.agree + latest.distribution.disagree + latest.distribution.uncertain;

  // Check if dominant position exceeds threshold
  let dominant = null;
  let dominantCount = 0;
  for (const pos of ['agree', 'disagree']) {
    if (latest.distribution[pos] / total >= CONSENSUS_THRESHOLD) {
      dominant = pos;
      dominantCount = latest.distribution[pos];
    }
  }

  if (!dominant) return null;

  // Check velocity stability over recent rounds
  const allStable = recent.every(s => s.velocity <= VELOCITY_THRESHOLD);
  if (!allStable) return null;

  // Consensus detected!
  const minority = dominant === 'agree' ? 'disagree' : 'agree';
  const latestCluster = latest.clusters.find(c => c.position === dominant);
  const minorityCluster = latest.clusters.find(c => c.position === minority);

  return {
    direction: dominant,
    confidence: Math.round((dominantCount / total) * 100),
    roundDetected: latest.round,
    dominantCluster: latestCluster || null,
    minorityCluster: minorityCluster || null,
    stabilityRounds: MIN_STABLE_ROUNDS,
    entropy: latest.entropy
  };
}


// ─────────────────────────────────────────────────────────────────────────
// Console Visualization (Terminal God View)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Print a God View status bar for the current round.
 * Uses ANSI colors for terminal display.
 */
export function printGodViewStatus(snapshot, round, totalRounds, consensusSignal = null) {
  const { distribution, velocity, entropy, clusters } = snapshot;
  const total = distribution.agree + distribution.disagree + distribution.uncertain;

  const agreeBar = '█'.repeat(Math.round((distribution.agree / total) * 30));
  const disagreeBar = '█'.repeat(Math.round((distribution.disagree / total) * 30));
  const uncertainBar = '░'.repeat(Math.round((distribution.uncertain / total) * 30));

  const green = '\x1b[32m';
  const red = '\x1b[31m';
  const yellow = '\x1b[33m';
  const cyan = '\x1b[36m';
  const bold = '\x1b[1m';
  const reset = '\x1b[0m';

  console.log(`\n   ${cyan}╔══════════════════════════════════════════════════════════════╗${reset}`);
  console.log(`   ${cyan}║${reset} ${bold}🔮 GOD VIEW${reset}  Round ${round}/${totalRounds}  │  Entropy: ${entropy.toFixed(3)}  │  Velocity: ${velocity}%  ${cyan}║${reset}`);
  console.log(`   ${cyan}╠══════════════════════════════════════════════════════════════╣${reset}`);
  console.log(`   ${cyan}║${reset}  ${green}AGREE    ${agreeBar}${reset}  ${distribution.agree}/${total} (${Math.round(distribution.agree/total*100)}%)`);
  console.log(`   ${cyan}║${reset}  ${red}DISAGREE ${disagreeBar}${reset}  ${distribution.disagree}/${total} (${Math.round(distribution.disagree/total*100)}%)`);
  console.log(`   ${cyan}║${reset}  ${yellow}UNSURE   ${uncertainBar}${reset}  ${distribution.uncertain}/${total} (${Math.round(distribution.uncertain/total*100)}%)`);

  if (consensusSignal) {
    const dir = consensusSignal.direction === 'agree' ? `${green}✅ AGREE` : `${red}❌ DISAGREE`;
    console.log(`   ${cyan}╠══════════════════════════════════════════════════════════════╣${reset}`);
    console.log(`   ${cyan}║${reset}  ${bold}⚡ CONSENSUS DETECTED${reset} → ${dir}${reset} @ ${consensusSignal.confidence}% confidence`);
  }

  console.log(`   ${cyan}╚══════════════════════════════════════════════════════════════╝${reset}`);
}


// ─────────────────────────────────────────────────────────────────────────
// Final Summary
// ─────────────────────────────────────────────────────────────────────────

/**
 * Generate a consensus summary object for inclusion in the assay report.
 * @param {Array} history - Full snapshot history
 * @param {Array} agents - Final agent states
 * @returns {object} - Summary for report generation
 */
export function generateConsensusSummary(history, agents) {
  const latest = history[history.length - 1];
  const first = history[0];
  const consensusSignal = detectConsensus(history);

  // Track position changes over time
  const trajectories = history.map(h => ({
    round: h.round,
    agree: h.distribution.agree,
    disagree: h.distribution.disagree,
    uncertain: h.distribution.uncertain,
    entropy: h.entropy,
    velocity: h.velocity
  }));

  // Identify most influential agents (those who changed positions the least)
  const agentStability = agents.map(a => {
    const positions = a.godView?.positionHistory || [];
    const changes = positions.filter((p, i) => i > 0 && p.position !== positions[i - 1].position).length;
    return { id: a.id, name: a.name, changes, finalPosition: a.godView?.position, confidence: a.godView?.confidence };
  }).sort((a, b) => a.changes - b.changes);

  return {
    consensusReached: !!consensusSignal,
    consensusSignal,
    finalDistribution: latest?.distribution || { agree: 0, disagree: 0, uncertain: 0 },
    initialDistribution: first?.distribution || { agree: 0, disagree: 0, uncertain: 0 },
    entropyTrajectory: { start: first?.entropy || 0, end: latest?.entropy || 0 },
    avgVelocity: Math.round(history.reduce((s, h) => s + h.velocity, 0) / history.length),
    trajectories,
    mostStableAgents: agentStability.slice(0, 5),
    mostVolatileAgents: agentStability.slice(-5).reverse(),
    totalRounds: history.length
  };
}
