import { notFound } from "next/navigation";

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const resolved = await params;
  if (!resolved.handle) return notFound();
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <h1 className="font-display text-3xl font-bold">Fan Passport: @{resolved.handle}</h1>
      <p className="mt-2 text-sm text-chalk/70">Public profile preview is available in this MVP.</p>
    </div>
  );
}
