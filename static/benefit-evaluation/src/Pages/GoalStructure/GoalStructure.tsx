import { useState } from "react";
import { useLocation } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import PageHeader from "@atlaskit/page-header";

//Sayna Inports:
import NewGoalTierButton from "../../SaynaSineFiler/NewGoalTierButton";
import GoalTierTableTree from "../../SaynaSineFiler/GoalTierTableTree";
import { GOAL_TYPE_DROPDOWN_ITEMS } from "../../SaynaSineFiler/goalDropdownItems";

export const GoalStructure = () => {
  const [scope] = useAppContext();

  //States for managing drawer and goal creation
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createGoalType, setCreateGoalType] = useState<string | null>(null);

  //New state to trigger refresh in GoalTierTableTree
  const [refreshTableTree, setRefreshTableTree] = useState(false);

  //Handler for when a type is selected for a new top-level goal
  const handleTopLevelGoalCreation = (selectedType: string) => {
    setCreateGoalType(selectedType);
    setIsDrawerOpen(true);
  };

  // Handler for closing the top-level goal creation drawer
  const handleTopLevelDrawerClose = (shouldRefresh?: boolean) => {
    console.log(
      "GoalStructure: handleTopLevelDrawerClose called, shouldRefresh:",
      shouldRefresh
    );
    setIsDrawerOpen(false);
    setCreateGoalType(null);

    if (shouldRefresh) {
      setRefreshTableTree((prev) => {
        console.log(
          "GoalStructure: Toggling refreshTableTree from",
          prev,
          "to",
          !prev
        ); // Keep this log!
        return !prev;
      });
    }
  };

  return (
    <>
      <PageHeader>Medfin</PageHeader>

      <div>
        {/* The TableTree component, which will now handle its own data fetching and rendering */}
        <GoalTierTableTree refreshTrigger={refreshTableTree} />
      </div>
    </>
  );
};
