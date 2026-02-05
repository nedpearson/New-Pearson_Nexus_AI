import type { ISpeechTranscriber, AudioInput } from "../providers/speech/ISpeechTranscriber";
import type { IngestContext, IngestResult, StoredArtifact } from "../types";
import { sha256OfBuffer } from "../utils/hash";
import { DEFAULT_SPEECH_GATE, needsReview } from "../utils/confidence";
import { routeVoiceTranscript } from "../routing/routeVoiceTranscript";

/**
 * Voice ingestion is transcript-first. You can optionally feed transcript into a doc-intel NLP extractor later.
 */
export type VoiceStorageAdapters = {
  putOriginalAudio: (sha256: string, input: AudioInput, ctx: IngestContext) => Promise<string>;
  putTranscript: (sha256: string, transcriptJson: unknown, ctx: IngestContext) => Promise<string>;
};

export async function ingestVoice(
  transcriber: ISpeechTranscriber,
  input: AudioInput,
  ctx: IngestContext,
  storage: VoiceStorageAdapters,
  correlationId: string
): Promise<IngestResult> {

  const sha256 =
    input.kind === "buffer"
      ? await sha256OfBuffer(input.buffer)
      : `uri:${Buffer.from(input.uri).toString("base64url")}`;

  const originalUri = await storage.putOriginalAudio(sha256, input, ctx);

  const transcript = await transcriber.transcribe(input, ctx);

  const lowSpeechConf = needsReview(transcript.confidence, DEFAULT_SPEECH_GATE);
  const routing = routeVoiceTranscript(transcript.text, transcript.confidence, ctx, lowSpeechConf);

  const transcriptUri = await storage.putTranscript(sha256, {
    transcript,
    routing,
    ctx,
    correlationId,
    provider: transcriber.name
  }, ctx);

  const stored: StoredArtifact = {
    sha256,
    originalUri,
    transcriptUri,
    createdAt: new Date().toISOString()
  };

  return {
    sha256,
    transcript: { text: transcript.text, confidence: transcript.confidence },
    routing,
    stored,
    correlationId
  };
}

