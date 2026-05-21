export function StadiumBackground() {
  return (
    <>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/landing-football-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
      <div className="absolute inset-0 bg-stadium-glow" />
    </>
  );
}
