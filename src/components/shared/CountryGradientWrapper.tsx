import { ReactNode } from "react";

export function CountryGradientWrapper({ children }: { children: ReactNode }) {
  return <div className="country-gradient">{children}</div>;
}
