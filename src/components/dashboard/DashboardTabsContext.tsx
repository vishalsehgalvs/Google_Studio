import { createContext } from "react";

export const TabsContext = createContext<{ activeTab: string }>({ activeTab: "diagnosis" });
