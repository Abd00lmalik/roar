import { EnterStadiumButton } from "@/components/onboarding/EnterStadiumButton";

export default function HomePage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f]">
      <video
        src={process.env.NEXT_PUBLIC_STADIUM_VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <EnterStadiumButton />
    </section>
  );
}
