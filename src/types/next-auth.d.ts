import "next-auth";
import "next-auth/jwt";

/**
 * NextAuth type augmentation for RoarTube.
 *
 * Extends the base Session and JWT types to expose:
 *   - user.id            — Google sub / Supabase user UUID
 *   - user.walletAddress — Circle-provisioned EOA wallet address
 *   - user.circleWalletId — Circle internal wallet ID (for balance queries)
 *   - user.displayName   — display name from Google profile
 */
declare module "next-auth" {
  interface User {
    id: string;
  }

  interface Session {
    user: {
      id: string;
      walletAddress: string | null;
      circleWalletId: string | null;
      displayName: string | null;
      circleWalletAddress?: string | null;
      supporterNation?: string | null;
      // Standard fields
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    sub?: string;
    walletAddress?: string | null;
    circleWalletId?: string | null;
    displayName?: string | null;
    circleWalletAddress?: string | null;
    supporterNation?: string | null;
  }
}
