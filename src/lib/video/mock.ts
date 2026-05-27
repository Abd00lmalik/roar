export const MOCK_VIDEO_URL =
  "https://assets.mixkit.co/videos/preview/mixkit-soccer-ball-kicked-into-the-net-40618-large.mp4";

export function mockCloudflareUpload() {
  return {
    uid: `mock_${crypto.randomUUID()}`,
    uploadURL: MOCK_VIDEO_URL,
    readyToStream: true,
  };
}
