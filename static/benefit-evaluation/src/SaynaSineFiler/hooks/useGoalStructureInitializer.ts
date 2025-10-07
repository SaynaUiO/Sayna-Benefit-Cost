import { useState, useEffect } from "react";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { GoalCollection, GoalTierTypeEnum } from "../../Models";

//Denne filen kjører koden én gang for å opprette standard GoalCollection, og for å slette tidligere

// Definer de faste dataene (kan også flyttes til en constants-fil)
const rootData = [
  { id: "root-formaal", name: "Formål", description: "Toppnivå mål/OKR'er." },
  { id: "root-effektmaal", name: "Effektmål", description: "Målbare verdier." },
  { id: "root-epic", name: "Epic", description: "Produktmål." },
];

const rootNames = rootData.map(d => d.name);

export const useGoalStructureInitializer = () => {
  const [scope] = useAppContext();
  const api = useAPI();
  const [initialized, setInitialized] = useState(false);
  const [rootCollections, setRootCollections] = useState<GoalCollection[]>([]);

  useEffect(() => {
    const initializeCollections = async () => {
      if (!scope.id || initialized) return;

      try {
        // --- 1. Sletting og Opprettelse (Din eksisterende logikk) ---
        let existingCollections = await api.goalCollection.getAll(scope.id);
        const existingNames = new Set(existingCollections.map((c) => c.name));

        const collectionsToDelete = existingCollections.filter(
          (c) => !rootNames.includes(c.name)
        );
        
        // Utfør sletting
        if (collectionsToDelete.length > 0) {
            const deletePromises = collectionsToDelete.map(c => api.goalCollection.delete(scope.id, c.id));
            await Promise.all(deletePromises);
            // Henter på nytt etter sletting for å få en ren base
            existingCollections = await api.goalCollection.getAll(scope.id);
        }

        // Oppretting:
        const collectionsToCreate = rootData.filter(
          (d) => !existingNames.has(d.name)
        );

        if (collectionsToCreate.length > 0) {
            const creationPromises = collectionsToCreate.map(async (d) => {
                const newCollection: GoalCollection = {
                    id: d.id,
                    scopeId: scope.id,
                    type: GoalTierTypeEnum.GOAL_COLLECTION,
                    name: d.name,
                    description: d.description,
                };
                return api.goalCollection.create(scope.id, newCollection);
            });
            await Promise.all(creationPromises);
        }
        
        // --- 2. HENTING OG LAGRING AV DATA TIL STATE ---
        const finalCollections = await api.goalCollection.getAll(scope.id);
        const filteredCollections = finalCollections.filter(c => rootNames.includes(c.name));
        
        setRootCollections(filteredCollections); 
        setInitialized(true);

      } catch (error) {
        console.error("Feil under initialisering av GoalCollections:", error);
      }
    };
    initializeCollections();
  }, [scope.id]); // Fjerne 'initialized' fra dependencies da vi bruker det internt i if-sjekken

  return { initialized, rootCollections };
};
