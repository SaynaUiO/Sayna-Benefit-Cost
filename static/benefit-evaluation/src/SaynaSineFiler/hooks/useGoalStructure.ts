//Fil som inneholder all fetching, states, oh handelers

import { useCallback, useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { Goal, GoalTableItem, GoalTableItemTypeEnum } from "../../Models";
import { useGoalInitializer } from "../MockData/goalsMockData";
import { useGoalStructureInitializer } from "./useGoalStructureInitializer";


type GoalType = "Objective" | "Benefit" | "Product";

interface DrawerState {
    goalType: GoalType; 
    goalCategory?: string;
    goalToEdit: Goal | null;
}

interface CostTimeModalState {
  isOpen: boolean;
  goals: GoalTableItem[];
  upperIsMonetary: boolean;
  postfix: string;
}

//Hardkode GoalCollection ID-ene for filtrering: 
const EPIC_COLLECTION_ID = "root-epic";
const FORMAAL_COLLECTION_ID = "root-formaal";
const EFFEKT_COLLECTION_ID = "root-effektmaal";

export const useGoalStructure = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  //Henter initialiseringsstatus: 
  const { initialized: collectionsInitialized } = useGoalStructureInitializer();
  const { initialized: goalsInitialized } = useGoalInitializer();
  const fullyInitialized = collectionsInitialized && goalsInitialized;

  //State for Data og UI: 
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DrawerState | null>(null);
  const [costTimeModal, setCostTimeModal] = useState<CostTimeModalState | null>(null);

  //Data fetching logikk: 
   const fetchAndOrganizeGoals = useCallback(async () => {
    if (!fullyInitialized || !scope.id) return;

    try {
      const allCollections = await api.goalCollection.getAll(scope.id);
      let allGoals: Goal[] = [];

      for (const collection of allCollections) {
        const goalsInCollection = await api.goal.getAll(
          scope.id,
          collection.id
        );
        allGoals = allGoals.concat(goalsInCollection);
      }

      setGoals(allGoals);
    } catch (error) {
      console.error("Feil under henting av data:", error);
    }
  }, [fullyInitialized, scope.id, api]);

  useEffect(() => {
    fetchAndOrganizeGoals();
  }, [fetchAndOrganizeGoals]);


  //Handelers for Drawer:
    const onCloseDrawer = useCallback(
    (shouldRefresh?: boolean) => {
      setIsDrawerOpen(false);
      setDrawerContext(null);
      if (shouldRefresh) {
        fetchAndOrganizeGoals();
      }
    },
    [fetchAndOrganizeGoals]
  );

  //Edit goal handler:
  const handleEditGoal = (goal: Goal) => {
    let type: GoalType;
    if (goal.goalCollectionId === EPIC_COLLECTION_ID) type = "Product";
    else if (goal.goalCollectionId === FORMAAL_COLLECTION_ID)
      type = "Objective";
    else type = "Benefit";

    setDrawerContext({
      goalType: type,
      goalCategory: type === "Benefit" ? goal.goalCollectionId : undefined,
      goalToEdit: goal,
    });
    setIsDrawerOpen(true);
  };

    //Add new goal handler:
    const handleAddGoal = (
    goalType: GoalType,
    goalCollectionId: string
  ) => {
    setDrawerContext({
      goalType: goalType,
      goalCategory: goalType === "Benefit" ? goalCollectionId : undefined,
      goalToEdit: null,
    });
    setIsDrawerOpen(true);
  };

  //Delete goal handler:
  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      const goalToDelete = goals?.find((g) => g.id === goalId);

      if (!goalToDelete) {
        alert("Goal not found in current data set. Cannot delete.");
        return;
      }
      if (
        !window.confirm(
          `Er du sikker på at du vil slette målet ${
            goalToDelete.key || goalId
          }?`
        )
      ) {
        return;
      }

      const collectionId = goalToDelete.goalCollectionId;

      try {
        await api.goal.delete(scope.id, collectionId, goalId);
        console.log(
          `Goal deleted successfully from ${collectionId}: ${goalId}`
        );
        fetchAndOrganizeGoals();
      } catch (error) {
        console.error("Failed to delete goal:", error);
        alert("Klarte ikke å slette målet. Vennligst prøv igjen.");
      }
    },
    [scope.id, api.goal, fetchAndOrganizeGoals, goals]
  );

  //Cost/Tieme modal handlers:
    const handleSetCostTime = (epicGoals: Goal[]) => {
    // VIKTIG: Mappingen fra Goal.type til GoalTableItem.type
    const mappedGoals: GoalTableItem[] = epicGoals.map((goal) => ({
      ...goal,
      // Casting er nødvendig pga. ulikheten i Enum-typene
      type: goal.type as unknown as GoalTableItemTypeEnum,
    }));

    const isMonetary = false;
    const currencyPostfix = "pts";

    setCostTimeModal({
      isOpen: true,
      goals: mappedGoals,
      upperIsMonetary: isMonetary,
      postfix: currencyPostfix,
    });
  };
  
  const handleCostTimeModalClose = (shouldRefresh = false) => {
    setCostTimeModal(null);
    if (shouldRefresh) {
      fetchAndOrganizeGoals();
    }
  };

  //Data filtrering for rendering: 
   const allGoals = goals || [];
  
  const epicGoals = allGoals.filter(
    (goal) => goal.goalCollectionId === EPIC_COLLECTION_ID
  );
  const formaalGoals = allGoals.filter(
    (goal) => goal.goalCollectionId === FORMAAL_COLLECTION_ID
  );
  const effektGoals = allGoals.filter(
    (goal) => goal.goalCollectionId === EFFEKT_COLLECTION_ID
  );
  
  //Return verdier: 
    return {
        //Data: 
         loading: !fullyInitialized || !goals,
    allGoals,
    epicGoals,
    formaalGoals,
    effektGoals,
    EPIC_COLLECTION_ID,

    //Handelers:
    handlers: {
      handleAddGoal,
      handleEditGoal,
      handleDeleteGoal,
      onCloseDrawer,
      handleSetCostTime,
      handleCostTimeModalClose,
    },

    //UI state:
    drawer: {
      isDrawerOpen,
      context: drawerContext,
    },
    costTimeModal,
    scope
  };


  


}