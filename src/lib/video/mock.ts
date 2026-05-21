export const MOCK_VIDEO_URL =
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4";

export function mockCloudflareUpload() {
  return {
    uid: `mock_${crypto.randomUUID()}`,
    uploadURL: MOCK_VIDEO_URL,
    readyToStream: true,
  };
}
