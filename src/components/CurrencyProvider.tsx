"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CurrencyCode } from "@/lib/utils";
import { formatCurrency as _fmt } from "@/lib/utils";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  fmt: (n) => _fmt(n, "USD"),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    const stored = localStorage.getItem("currency") as CurrencyCode | null;
    if (stored) setCurrencyState(stored);
  }, []);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt: (n) => _fmt(n, currency) }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
