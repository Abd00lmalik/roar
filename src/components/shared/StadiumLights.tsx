"use client";

export function StadiumLights() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-floodlight/20 blur-3xl animate-pulse" />
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-floodlight/20 blur-3xl animate-pulse [animation-delay:1s]" />
    </div>
  );
}
