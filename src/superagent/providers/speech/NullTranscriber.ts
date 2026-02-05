import type { ISpeechTranscriber, AudioInput, Transcript } from "./ISpeechTranscriber";
import type { IngestContext } from "../../types";

/**
 * Safe placeholder that never guesses.
 * Use until you wire Whisper / Azure Speech / Google STT / Deepgram etc.
 */
export class NullTranscriber implements ISpeechTranscriber {
  public readonly name = "null-transcriber";

  async transcribe(input: AudioInput, ctx: IngestContext): Promise<Transcript> {
    return {
      text: "",
      confidence: 0,
      providerMeta: { inputKind: input.kind, filename: ctx.filename ?? "unknown" }
    };
  }
}

