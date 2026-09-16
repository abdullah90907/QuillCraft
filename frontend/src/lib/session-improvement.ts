export interface SessionQuestionAttempt {
  botId?: string;
  question: string;
  confidence: number;
  configVersion: number;
  timestamp: number;
}

/**
 * Computes textual similarity between two strings returning a score between 0.0 and 1.0.
 * Combines normalized Levenshtein similarity and word-token Dice similarity.
 */
export function computeTextSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();

  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  // 1. Normalized Levenshtein similarity
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(0));

  for (let i = 0; i <= s1.length; i++) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j++) {
    track[j][0] = j;
  }

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + cost // substitution
      );
    }
  }

  const levDistance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  const levSim = 1 - levDistance / maxLen;

  // 2. Token / word-level Dice similarity
  const words1 = s1.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const words2 = s2.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);

  let wordSim = 0;
  if (words1.length && words2.length) {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    let intersection = 0;
    for (const w of set1) {
      if (set2.has(w)) intersection++;
    }
    wordSim = (2 * intersection) / (set1.size + set2.size);
  }

  return Math.max(levSim, wordSim);
}

/**
 * Checks if the current question is at least 80% similar to an earlier attempt
 * asked before the bot's configuration was edited, and whether confidence improved by >= 15 points.
 */
export function detectConfidenceImprovement(
  newQuestion: string,
  newConfidence: number,
  currentConfigVersion: number,
  attempts: SessionQuestionAttempt[],
  currentBotId?: string | null
): {
  improved: boolean;
  matchedAttempt?: SessionQuestionAttempt;
  similarity?: number;
  pointDiff?: number;
} {
  // Only compare against attempts recorded BEFORE the bot configuration was edited
  const priorAttempts = attempts.filter((a) => {
    if (currentBotId && a.botId && a.botId !== currentBotId) {
      return false;
    }
    return a.configVersion < currentConfigVersion;
  });

  if (!priorAttempts.length) {
    return { improved: false };
  }

  // Find all matches with >= 80% similarity
  const matches: Array<{ attempt: SessionQuestionAttempt; similarity: number; pointDiff: number }> = [];

  for (const attempt of priorAttempts) {
    const sim = computeTextSimilarity(newQuestion, attempt.question);
    if (sim >= 0.80) {
      matches.push({
        attempt,
        similarity: sim,
        pointDiff: newConfidence - attempt.confidence,
      });
    }
  }

  if (!matches.length) {
    return { improved: false };
  }

  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);

  // Check if any matching prior attempt improved by at least 15 points
  const qualifying = matches.find((m) => m.pointDiff >= 15);
  if (qualifying) {
    return {
      improved: true,
      matchedAttempt: qualifying.attempt,
      similarity: qualifying.similarity,
      pointDiff: qualifying.pointDiff,
    };
  }

  return {
    improved: false,
    matchedAttempt: matches[0].attempt,
    similarity: matches[0].similarity,
    pointDiff: matches[0].pointDiff,
  };
}
