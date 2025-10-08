//Filen som samler alt sammen og brukes i GoalStructure.tsx for å få det opp på skjermen

import { useEffect, useState } from "react";
import { useGoalStructureInitializer } from "../hooks/useGoalStructureInitializer";
import { useGoalInitializer } from "../MockData/goalsMockData";
import { Goal } from "../../Models";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useGoalCleaner } from "../MockData/DeleteGoal";
import { EpicTableTree } from "./EpicTableTree";
import { ObjectiveTableTree } from "./FormaalTableTree";
import { BenefitTableTree } from "./NytteTableTree";

// Importer useGoalCleaner hvis du bruker knappen, ellers fjern den
// import { useGoalCleaner } from '../hooks/useGoalCleaner';

// Definerer data-typene for klarhet (som i den minimalistiske versjonen)
interface GoalData {
  goals: Goal[] | null;
}

// Hardkode GoalCollection ID-ene for filtrering
const EPIC_COLLECTION_ID = "root-epic";
const FORMAAL_COLLECTION_ID = "root-formaal";
const EFFEKT_COLLECTION_ID = "root-effektmaal";

export const GoalStructureContainer2 = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  // Henter initialiseringsstatus og slette-funksjoner
  const { initialized: collectionsInitialized } = useGoalStructureInitializer();
  const { initialized: goalsInitialized } = useGoalInitializer();
  const { clearTestGoals, isDeleting } = useGoalCleaner();

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
        onAddGoal={() => {}} // Bruk mock funksjoner
        onEditGoal={() => {}}
        onDeleteGoal={() => {}}
      />

      <BenefitTableTree
        data={effektGoals}
        onAddGoal={() => {}} // Bruk mock funksjoner
        onEditGoal={() => {}}
        onDeleteGoal={() => {}}
      />

      {/* Produkt (Epic) */}
      <div style={{ marginBottom: "40px" }}>
        <EpicTableTree
          data={epicGoals}
          onAddGoal={() => {}} // Bruk mock funksjoner
          onEditGoal={() => {}}
          onDeleteGoal={() => {}}
        />
      </div>

      {/* Her kan du legge til Effektmål-tabellen senere */}

      {/* 3. Viser alle mål som JSON for debug */}
      <h2 style={{ marginTop: "30px" }}>Alle Hentede Goals (DEBUG)</h2>
      <pre style={{ backgroundColor: "#f4f4f4", padding: "10px" }}>
        {JSON.stringify(fetchedData.goals, null, 2)}
      </pre>
    </div>
  );
};
