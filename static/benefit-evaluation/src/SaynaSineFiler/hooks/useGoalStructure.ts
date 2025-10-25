//Fil som inneholder all fetching, states, oh handelers
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { Goal, GoalCollection, GoalTableItem, GoalTableItemTypeEnum } from "../../Models";
import { useGoalStructureInitializer } from "./useGoalStructureInitializer";
import { useGoalInitializer } from "./useGoalDataInitializer";
import { EPIC_COLLECTION_ID, NYTTE_COLLECTION_ID, FORMAAL_COLLECTION_ID } from "../constants/goalConstants";

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


export const useGoalStructure = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  //Henter initialiseringsstatus: 
  const { initialized: collectionsInitialized } = useGoalStructureInitializer();
  const { initialized: goalsInitialized } = useGoalInitializer();
  const fullyInitialized = collectionsInitialized && goalsInitialized;

  //State for Data og UI: 
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [allCollections, setAllCollections] = useState<GoalCollection[] | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DrawerState | null>(null);
  const [costTimeModal, setCostTimeModal] = useState<CostTimeModalState | null>(null);

  //State for sletting: 
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null); 

  //Data fetching logikk: 
   const fetchAndOrganizeGoals = useCallback(async () => {
    if (!fullyInitialized || !scope.id) return;

    try {
      const allCollections = await api.goalCollection.getAll(scope.id);
      setAllCollections(allCollections); // <-- LAGRE HER
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


  // 3. ISOLER Formål-samlingen fra state (allCollections)
  const formaalCollectionData = useMemo(() => {
    return allCollections?.find(
        (c) => c.id === FORMAAL_COLLECTION_ID
    );
  }, [allCollections]);


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

  //Åpner Modal for sleting: 
  const openDeleteModal = useCallback((goal: Goal) => { 
        setGoalToDelete(goal); // Lagrer målet i state for modalen
    }, []); 

    // Funksjon for å lukke modalen
    const closeDeleteModal = useCallback(() => {
        setGoalToDelete(null); 
    }, []);

  //Delete goal handler:
const handleDeleteGoal = useCallback(async () => {
        const goal = goalToDelete; 

        if (!goal) {
            console.error("Sletting mislyktes: Mål-objektet mangler i state.");
            closeDeleteModal();
            return;
        }

        const goalId = goal.id;
        const collectionId = goal.goalCollectionId; 

        try {
            // 2. API Kall
            await api.goal.delete(scope.id, collectionId, goalId);
            console.log(`Goal deleted successfully from ${collectionId}: ${goalId}`);
            
            // 3. Oppdatering og Lukking
            fetchAndOrganizeGoals();
            closeDeleteModal(); 
            
        } catch (error) {
            console.error("Failed to delete goal:", error);
            alert("Klarte ikke å slette målet. Vennligst prøv igjen.");
            closeDeleteModal(); 
        }
    }, [scope.id, api.goal, fetchAndOrganizeGoals, closeDeleteModal, goalToDelete]);

  //Handle update Objectiove description: 
  const handleUpdateCollectionDescription = useCallback(
    async (collectionToUpdate: GoalCollection, newDescription: string) => {
        if (!scope.id) return;

        const updatedCollection: GoalCollection = {
            ...collectionToUpdate,
            description: newDescription,
        };

        try {
            await api.goalCollection.update(
                scope.id,                 // 1. scopeId
                updatedCollection         // 2. goalCollection (Inneholder ID-en)
            );

            console.log("GoalCollection beskrivelse oppdatert:", updatedCollection.id);
            fetchAndOrganizeGoals();

        } catch (error) {
            console.error("Feil ved oppdatering av GoalCollection beskrivelse:", error);
            alert("Klarte ikke å lagre beskrivelsen. Sjekk konsollen.");
        }
    },
    [scope.id, api.goalCollection, fetchAndOrganizeGoals]
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
    (goal) => goal.goalCollectionId === NYTTE_COLLECTION_ID
  );
  
  //Return verdier: 
    return {
        //Data: 
         loading: !fullyInitialized || !goals,
    allGoals,
    epicGoals,
    formaalGoals,
    formaalCollectionData,
    effektGoals,

    //Handelers:
    handlers: {
      handleAddGoal,
      handleEditGoal,
      handleDeleteGoal,
      onCloseDrawer,
      handleSetCostTime,
      handleCostTimeModalClose,
      handleUpdateCollectionDescription,
      onDeleteGoal: openDeleteModal,
    },

    //Delete state 
        deleteModal: {
            isOpen: !!goalToDelete, 
            goalToDelete: goalToDelete,
            onClose: closeDeleteModal,
            onConfirm: handleDeleteGoal
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