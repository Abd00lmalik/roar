// src/lib/circle/client.ts
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

let _client: ReturnType<typeof initiateDeveloperControlledWalletsClient> | null = null;

export function getCircleClient() {
  if (_client) return _client;

  const apiKey       = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    throw new Error("[Circle] CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set");
  }

  _client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
  return _client;
}
