import type { IngestContext } from "../../types";

export type AudioInput =
  | { kind: "buffer"; buffer: Buffer; mimeType: string }
  | { kind: "uri"; uri: string; mimeType?: string };

export type Transcript = {
  text: string;
  confidence: number;
  providerMeta: Record<string, unknown>;
};

export interface ISpeechTranscriber {
  readonly name: string;

  transcribe(input: AudioInput, ctx: IngestContext): Promise<Transcript>;
}

