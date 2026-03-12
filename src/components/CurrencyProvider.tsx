"use client";

import { createContext, useContext } from "react";
import { formatCurrency } from "@/lib/utils";

interface CurrencyContextType {
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  fmt: (n) => formatCurrency(n, "VND"),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyContext.Provider value={{ fmt: (n) => formatCurrency(n, "VND") }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
