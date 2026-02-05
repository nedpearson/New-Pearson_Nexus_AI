function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export class DeepgramSpeechTranscriber {
  constructor(opts = {}) {
    this.apiKey = opts.apiKey || process.env.DEEPGRAM_API_KEY || "";
    this.model = opts.model || process.env.DEEPGRAM_MODEL || "nova-2";
    this.language = opts.language || process.env.DEEPGRAM_LANGUAGE || "en";
  }

  async transcribe({ bytes, mimeType, correlationId }) {
    const key = this.apiKey || requiredEnv("DEEPGRAM_API_KEY");
    const url = new URL("https://api.deepgram.com/v1/listen");
    url.searchParams.set("model", this.model);
    url.searchParams.set("language", this.language);
    url.searchParams.set("smart_format", "true");
    url.searchParams.set("punctuate", "true");

    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Token ${key}`,
        "Content-Type": mimeType || "application/octet-stream",
        "x-correlation-id": correlationId,
      },
      body: bytes,
    });
    const json = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(`Deepgram failed: ${resp.status} ${JSON.stringify(json)}`);
    }

    const alt = json?.results?.channels?.[0]?.alternatives?.[0];
    const transcript = String(alt?.transcript || "").trim();
    const confidence = clamp01(Number(alt?.confidence ?? 0));

    return {
      transcript,
      confidence,
      metadata: { provider: "deepgram", model: this.model, language: this.language },
    };
  }
}

