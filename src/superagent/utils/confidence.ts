export type Gate = {
  threshold: number; // e.g. 0.90
  allowAutoFinalize: boolean; // if false, low confidence always => needs review
};

export const DEFAULT_DOC_GATE: Gate = {
  threshold: 0.90,
  allowAutoFinalize: false
};

export const DEFAULT_SPEECH_GATE: Gate = {
  threshold: 0.90,
  allowAutoFinalize: false
};

export function needsReview(confidence: number, gate: Gate): boolean {
  if (confidence >= gate.threshold) return false;
  return !gate.allowAutoFinalize;
}

