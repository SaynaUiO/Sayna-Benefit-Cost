// Import other components and contexts
import { useAppContext } from "../Contexts/AppContext";
import { useAPI } from "../Contexts/ApiContext";

import { GoalStructureView } from "./components/GoalStructureView";

// Import shared types
// Import shared enums and mapping functions

// Define props for GoalTierTableTree to accept refreshTrigger
type GoalTierTableTreeProps = {
  refreshTrigger: boolean;
};

const GoalTierTableTree = ({ refreshTrigger }: GoalTierTableTreeProps) => {
  const [scope] = useAppContext();
  const api = useAPI();

  return (
    <>
      <div>
        <GoalStructureView />
      </div>
    </>
  );
};

export default GoalTierTableTree;
