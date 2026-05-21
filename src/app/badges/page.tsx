"use client";

import { useState } from "react";
import { useBadges } from "@/hooks/useBadges";
import { BadgeCard } from "@/components/badges/BadgeCard";
import { ClaimModal } from "@/components/badges/ClaimModal";

export default function BadgesPage() {
  const { data } = useBadges();
  const [claimedIds, setClaimedIds] = useState<number[]>([1]);
  const [showModal, setShowModal] = useState(false);

  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <h1 className="font-display text-4xl font-bold">Badge Gallery</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {data.map((badge) => (
          <BadgeCard
            key={badge.id}
            icon={badge.icon}
            name={badge.name}
            description={badge.description}
            claimed={claimedIds.includes(badge.id)}
            onClaim={() => {
              setClaimedIds((prev) => [...prev, badge.id]);
              setShowModal(true);
            }}
          />
        ))}
      </div>
      <ClaimModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
