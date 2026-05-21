export async function createCloudflareDirectUpload() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !token) return null;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: 3600,
        requireSignedURLs: false,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Cloudflare direct upload init failed");
  }

  const data = await response.json();
  return data.result as { uid: string; uploadURL: string };
}
