export type SpeechTranscribeInput = {
  bytes: Uint8Array;
  mimeType: string;
  filename?: string;
  correlationId: string;
};

export type SpeechTranscribeResult = {
  transcript: string;
  confidence: number;
  metadata: Record<string, unknown>;
};

export interface ISpeechTranscriber {
  transcribe(input: SpeechTranscribeInput): Promise<SpeechTranscribeResult>;
}

