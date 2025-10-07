//Filen som samler alt sammen og brukes i GoalStructure.tsx for å få det opp på skjermen

import { useEffect, useState } from "react";
import { useGoalStructureInitializer } from "../hooks/useGoalStructureInitializer";
import { useGoalInitializer } from "../MockData/goalsMockData";
import { Goal } from "../../Models";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useGoalCleaner } from "../MockData/DeleteGoal";

// Importer useGoalCleaner hvis du bruker knappen, ellers fjern den
// import { useGoalCleaner } from '../hooks/useGoalCleaner';

// Definerer en enkel type for å holde all den hentede dataen
interface GoalData {
  collections: any[] | null;
  effektmål: any[] | null;
  epics: any[] | null;
}

export const GoalStructureContainer2 = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  // Henter kun initialiseringsstatus
  const { initialized: collectionsInitialized } = useGoalStructureInitializer();
  const { initialized: goalsInitialized } = useGoalInitializer();
  // const { clearTestGoals, isDeleting } = useGoalCleaner(); // Fjern hvis du ikke trenger knappen

  const fullyInitialized = collectionsInitialized && goalsInitialized;

  // NY STATE: Lagrer all data som skal vises i JSON-format
  const [fetchedData, setFetchedData] = useState<GoalData>({
    collections: null,
    effektmål: null,
    epics: null,
  });

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      // 1. KUN KJØR HVIS ALT ER INITIALISERT
      if (!fullyInitialized || !scope.id) return;

      try {
        // Hent alle Promise-ene parallelt (raskere enn å vente på hver enkelt)
        const [allCollections, allEffektmål, allEpic] = await Promise.all([
          api.goalCollection.getAll(scope.id),
          api.goal.getAll(scope.id, "root-effektmaal"),
          api.goal.getAll(scope.id, "root-epic"),
        ]);

        // 2. Oppdater state med resultatene
        setFetchedData({
          collections: allCollections,
          effektmål: allEffektmål,
          epics: allEpic,
        });
      } catch (error) {
        console.error("Feil under henting av data:", error);
      }
    };

    fetchDataAndSetState();
  }, [fullyInitialized, scope.id, api]);

  // --- RENDERING ---

  // Viser "Laster..." hvis data ikke er hentet ennå
  if (!fullyInitialized || !fetchedData.collections) {
    return <div>Laster struktur og mål...</div>;
  }

  return (
    <div>
      <h3>Datautskrift</h3>

      {/* Seksjon: Alle Goals (Effektmål og Epics) */}
      <h4>Goals (Effektmål & Epics)</h4>
      <pre className="text-xs mt-4 bg-gray-100 p-2">
        {/* Bruker '?' for å sikre at det ikke krasjer hvis data er null */}
        {JSON.stringify(
          [...(fetchedData.effektmål || []), ...(fetchedData.epics || [])],
          null,
          3
        )}
      </pre>

      {/* Seksjon: GoalCollections */}
      <h4>GoalCollections</h4>
      <pre className="text-xs mt-4 bg-gray-100 p-2">
        {JSON.stringify(fetchedData.collections, null, 3)}
      </pre>

      {/* Legg til knappen her om nødvendig: */}
      {/* <button onClick={clearTestGoals} disabled={isDeleting}>...</button> */}
    </div>
  );
};
