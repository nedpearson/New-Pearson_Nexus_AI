import { createHash } from "node:crypto";

export async function sha256OfBuffer(buf: Buffer): Promise<string> {
  const h = createHash("sha256");
  h.update(buf);
  return h.digest("hex");
}

