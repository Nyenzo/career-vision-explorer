
import React, { createContext, useContext } from "react";
import useInsightsData from "./use-insights-data";

const InsightsContext = createContext<ReturnType<typeof useInsightsData> | undefined>(undefined);

export const InsightsProvider = ({ children }: { children: React.ReactNode }) => {
  const insightsData = useInsightsData();
  
  return (
    <InsightsContext.Provider value={insightsData}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error("useInsights must be used within an InsightsProvider");
  }
  return context;
};
