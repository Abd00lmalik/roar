export function StadiumBackground() {
  return (
    <>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/images/stadium-poster.jpg"
      >
        <source src="/videos/stadium-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay — keeps text readable over bright stadium footage */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-stadium-glow" />
    </>
  );
}
