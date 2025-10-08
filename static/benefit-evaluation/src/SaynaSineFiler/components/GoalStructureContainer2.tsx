//Filen som samler alt sammen og brukes i GoalStructure.tsx for å få det opp på skjermen

import { useCallback, useEffect, useState } from "react";
import { useGoalStructureInitializer } from "../hooks/useGoalStructureInitializer";
import { useGoalInitializer } from "../MockData/goalsMockData";
import {
  Goal,
  GoalTableItem,
  GoalTableItemTypeEnum,
  GoalTypeEnum,
} from "../../Models";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useGoalCleaner } from "../MockData/DeleteGoal";
import { EpicTableTree } from "./EpicTableTree";
import { ObjectiveTableTree } from "./FormaalTableTree";
import { BenefitTableTree } from "./NytteTableTree";
import GoalDrawer from "./GoalDrawer2";
import { SetEpicCostTime } from "../../Pages/GoalTiers/SetEpicCostTime";

// Importer useGoalCleaner hvis du bruker knappen, ellers fjern den
// import { useGoalCleaner } from '../hooks/useGoalCleaner';

// Definerer data-typene for klarhet (som i den minimalistiske versjonen)

type GoalType = "Objective" | "Benefit" | "Product";

// Definerer typen for de dynamiske propsene du sender til skuffen
interface DrawerState {
  goalType: GoalType;
  goalCategory?: string; // GoalCollectionId for Benefit
  goalToEdit: Goal | null;
}

interface GoalData {
  goals: Goal[] | null;
}

// Hardkode GoalCollection ID-ene for filtrering
const EPIC_COLLECTION_ID = "root-epic";
const FORMAAL_COLLECTION_ID = "root-formaal";
const EFFEKT_COLLECTION_ID = "root-effektmaal";

interface CostTimeModalState {
  isOpen: boolean;
  goals: GoalTableItem[]; // Bruker den forventede GoalTableItem[]
  upperIsMonetary: boolean;
  postfix: string;
}

export const GoalStructureContainer2 = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  // Henter initialiseringsstatus og slette-funksjoner
  const { initialized: collectionsInitialized } = useGoalStructureInitializer();
  const { initialized: goalsInitialized } = useGoalInitializer();

  //State for goalDrwaer
  // Define state for the drawer's context
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContext, setDrawerContext] = useState<DrawerState | null>(null);

  const fullyInitialized = collectionsInitialized && goalsInitialized;

  // State for alle Goals
  const [fetchedData, setFetchedData] = useState<GoalData>({ goals: null });

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      if (!fullyInitialized || !scope.id) return;

      try {
        // Henter alle GoalCollections først (for å vite hvilke samlinger som finnes)
        const allCollections = await api.goalCollection.getAll(scope.id);

        let allGoals: Goal[] = [];

        // Looper gjennom alle samlinger for å hente alle mål
        for (const collection of allCollections) {
          const goalsInCollection = await api.goal.getAll(
            scope.id,
            collection.id
          );
          allGoals = allGoals.concat(goalsInCollection);
        }

        setFetchedData({ goals: allGoals });
      } catch (error) {
        console.error("Feil under henting av data:", error);
      }
    };

    fetchDataAndSetState();
  }, [fullyInitialized, scope.id, api]);

  // Funksjonen som henter og setter alle målene.
  // Må defineres med useCallback for å brukes som dependency i useEffect/useCallback
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

      setFetchedData({ goals: allGoals });
    } catch (error) {
      console.error("Feil under henting av data:", error);
    }
  }, [fullyInitialized, scope.id, api]); // Legg til alle dependencies her

  useEffect(() => {
    fetchAndOrganizeGoals(); // Kall den nye funksjonen
  }, [fetchAndOrganizeGoals]); // Bruk den som dependency

  // For editing a Goal
  const handleEditGoal = (goal: Goal) => {
    let type: GoalType;
    if (goal.goalCollectionId === EPIC_COLLECTION_ID) type = "Product";
    else if (goal.goalCollectionId === FORMAAL_COLLECTION_ID)
      type = "Objective";
    else type = "Benefit"; // Alt annet er Benefit

    setDrawerContext({
      goalType: type,
      goalCategory: type === "Benefit" ? goal.goalCollectionId : undefined,
      goalToEdit: goal,
    });
    setIsDrawerOpen(true);
  };

  // Funksjon for å opprette nytt mål
  const handleAddGoal = (
    goalType: GoalType,
    goalCollectionId: string // Må være den faktiske root-IDen
  ) => {
    setDrawerContext({
      goalType: goalType,
      goalCategory: goalType === "Benefit" ? goalCollectionId : undefined,
      goalToEdit: null,
    });
    setIsDrawerOpen(true);
  };

  //Funksjon for å slette en goal:
  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      const goalToDelete = fetchedData.goals?.find((g) => g.id === goalId);

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
    [scope.id, api.goal, fetchAndOrganizeGoals, fetchedData.goals]
  );

  //Handle cost og tid:
  // NY STATE:
  const [costTimeModal, setCostTimeModal] = useState<CostTimeModalState | null>(
    null
  );

  // Handler for å åpne modalen
  const handleSetCostTime = (epicGoals: Goal[]) => {
    // VIKTIG: Mappingen fra Goal.type til GoalTableItem.type
    const mappedGoals: GoalTableItem[] = epicGoals.map((goal) => ({
      ...goal,
      // Vi caster direkte, da vi antar verdiene er like
      type: goal.type as unknown as GoalTableItemTypeEnum,
      // Du kan også legge til andre påkrevde felter for GoalTableItem her
    }));

    // Disse verdiene må bestemmes av din applikasjonslogikk (basert på Goals over Epics)
    const isMonetary = false;
    const currencyPostfix = "pts";

    setCostTimeModal({
      isOpen: true,
      goals: mappedGoals,
      upperIsMonetary: isMonetary,
      postfix: currencyPostfix,
    });
  };

  // Handler for å lukke modalen (lik GoalDrawer)
  const handleCostTimeModalClose = (shouldRefresh = false) => {
    setCostTimeModal(null);
    if (shouldRefresh) {
      fetchAndOrganizeGoals();
    }
  };

  //Metoder for Drawer:

  //Update Drawer
  const onCloseDrawer = useCallback(
    (shouldRefresh?: boolean) => {
      setIsDrawerOpen(false);
      setDrawerContext(null); // VIKTIG: Nullstill hele konteksten
      if (shouldRefresh) {
        fetchAndOrganizeGoals();
      }
    },
    [fetchAndOrganizeGoals]
  );

  //Slutt på Metoder for Drawer:

  // --- Datafiltrering før Rendering ---

  // 1. Filtrer ut KUN Epic Goals
  const epicGoals =
    fetchedData.goals?.filter(
      (goal) => goal.goalCollectionId === EPIC_COLLECTION_ID
    ) || [];

  //Filterer kun Formaal goals
  const formaalGoals =
    fetchedData.goals?.filter(
      (goal) => goal.goalCollectionId === FORMAAL_COLLECTION_ID
    ) || [];

  //Filterer kun effekt (nytte) goals
  const effektGoals =
    fetchedData.goals?.filter(
      (goal) => goal.goalCollectionId === EFFEKT_COLLECTION_ID
    ) || [];

  // --- RENDERING ---

  if (!fullyInitialized || !fetchedData.goals) {
    return <div>Laster målstruktur...</div>;
  }

  return (
    <div style={{ padding: "2px" }}>
      <ObjectiveTableTree
        data={formaalGoals}
        onAddGoal={(goalCollectionId) =>
          handleAddGoal("Objective", goalCollectionId)
        }
        onEditGoal={handleEditGoal}
        onDeleteGoal={handleDeleteGoal}
      />
      <br></br>

      <BenefitTableTree
        data={effektGoals}
        onAddGoal={(goalCollectionId) =>
          handleAddGoal("Benefit", goalCollectionId)
        }
        onEditGoal={handleEditGoal}
        onDeleteGoal={handleDeleteGoal}
      />
      <br></br>

      {/* Produkt (Epic) */}
      <div style={{ marginBottom: "40px" }}>
        <EpicTableTree
          data={epicGoals}
          onAddGoal={(goalCollectionId) =>
            handleAddGoal("Product", goalCollectionId)
          }
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onSetCostTime={handleSetCostTime} // KOBLET TIL NY HANDLER
        />
      </div>

      {/* Drawer*/}
      {isDrawerOpen && drawerContext && (
        <GoalDrawer
          title={
            drawerContext.goalToEdit
              ? `Rediger ${drawerContext.goalToEdit.id}`
              : `Nytt Mål`
          }
          goalType={drawerContext.goalType}
          goalCategory={drawerContext.goalCategory}
          // parentId er fjernet herfra
          isOpen={isDrawerOpen}
          onClose={onCloseDrawer}
          goalToEdit={drawerContext.goalToEdit}
        />
      )}

      {/* NYTT: Modal for Cost/Time (Som i GoalTable.tsx) */}
      {costTimeModal && costTimeModal.isOpen && (
        <SetEpicCostTime
          items={costTimeModal.goals}
          scopeId={scope.id}
          // GoalTypeEnum.EPIC er mest sannsynlig en enum (nummer).
          // Vi må caste for å matche SetEpicCostTimeProps: scopeType: number;
          scopeType={GoalTypeEnum.GOAL as unknown as number}
          upperIsMonetary={costTimeModal.upperIsMonetary}
          postfix={costTimeModal.postfix}
          close={() => handleCostTimeModalClose(false)}
          refresh={() => handleCostTimeModalClose(true)}
        />
      )}

      {/* 3. Viser alle mål som JSON for debug */}
      <h2 style={{ marginTop: "30px" }}>Alle Hentede Goals (DEBUG)</h2>
      <pre style={{ backgroundColor: "#f4f4f4", padding: "10px" }}>
        {JSON.stringify(fetchedData.goals, null, 2)}
      </pre>
    </div>
  );
};
