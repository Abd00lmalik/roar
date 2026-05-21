"use client";

import { motion } from "framer-motion";

export function StadiumLights() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-floodlight/20 blur-3xl"
        animate={{ x: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-floodlight/20 blur-3xl"
        animate={{ x: [0, -40, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
