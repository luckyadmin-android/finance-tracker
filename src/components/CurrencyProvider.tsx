"use client";

import { createContext, useContext } from "react";
import type { CurrencyCode } from "@/lib/utils";
import { formatCurrency as _fmt } from "@/lib/utils";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "VND",
  setCurrency: () => {},
  fmt: (n) => _fmt(n, "VND"),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyContext.Provider value={{ currency: "VND", setCurrency: () => {}, fmt: (n) => _fmt(n, "VND") }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
