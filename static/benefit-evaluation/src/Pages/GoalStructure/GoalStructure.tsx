import { useState } from "react";
import { useLocation } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import PageHeader from "@atlaskit/page-header";

//Sayna Inports:
import NewGoalTierButton from "../../SaynaSineFiler/NewGoalTierButton";
import GoalTierTableTree from "../../SaynaSineFiler/GoalTierTableTree";
import { GOAL_TYPE_DROPDOWN_ITEMS } from "../../SaynaSineFiler/goalDropdownItems";
import GoalDrawer from "../../SaynaSineFiler/CreateGoalDrawer";

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
      <PageHeader>Målstruktur</PageHeader>

      <div>
        {/* Button to initiate creation of a new top-level goal */}
        <NewGoalTierButton
          buttonLabel="Nytt mål nivå"
          dropdownItems={GOAL_TYPE_DROPDOWN_ITEMS}
          onTypeSelectedForCreation={handleTopLevelGoalCreation} // Use the new prop
          isPrimary={true}
        />

        {/* GoalDrawer for top-level creations (no goalId or parentId) */}
        {isDrawerOpen && (
          <GoalDrawer
            title={`Create New ${createGoalType}`}
            goalType={createGoalType || "Goal"}
            isOpen={isDrawerOpen}
            onClose={handleTopLevelDrawerClose}
            // No goalId or parentId for top-level creation
          />
        )}

        {/* The TableTree component, which will now handle its own data fetching and rendering */}
        <GoalTierTableTree refreshTrigger={refreshTableTree} />
      </div>
    </>
  );
};
