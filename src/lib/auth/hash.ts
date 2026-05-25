import { createHash } from "crypto";

export function hashGoogleSub(googleSub: string): string {
  return createHash("sha256").update(googleSub).digest("hex");
}
