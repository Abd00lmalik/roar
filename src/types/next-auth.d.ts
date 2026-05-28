import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:               string;
      email:            string;
      name:             string;
      image:            string;
      role:             string;
      gateway_balance:  number;
      wallet_address:   string;
      circle_wallet_id: string;
      display_name:     string;
      avatar_url:       string;
      supporter_nation: string;

      // camelCase aliases for backward compatibility
      walletAddress?:   string | null;
      circleWalletId?:  string | null;
    };
  }
}
