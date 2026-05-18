import type { ReactNode } from "react";

import AurawattFooter from "./components/AurawattFooter";
import AurawattNavbar from "./components/AurawattNavbar";
import AurawattStyles from "./components/AurawattStyles";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AurawattStyles />
      <AurawattNavbar />
      {children}
      <AurawattFooter />
    </>
  );
}

