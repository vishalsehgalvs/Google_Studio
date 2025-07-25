import { useContext } from "react";
import { TabsContext } from "./DashboardTabsContext";

export function useTabActive(tabName: string) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === tabName;
}
