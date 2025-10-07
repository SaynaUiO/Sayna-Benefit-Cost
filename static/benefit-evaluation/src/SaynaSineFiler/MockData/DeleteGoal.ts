import { useCallback, useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { Goal } from "../../Models";

// Oppdatert for å matche DB-navnet ('maal' med dobbel a)
const TEST_COLLECTION_IDS = [
    "root-effektmaal",
    "root-epic" 
];

export const useGoalCleaner = () => {
    const [scope] = useAppContext();
    const api = useAPI();
    const [isDeleting, setIsDeleting] = useState(false);
    
    const clearTestGoals = useCallback(async () => {
        
        if (isDeleting || !scope.id) return 0;

        setIsDeleting(true);
        console.log("--- Starter opprydning av testmål i DB ---");
        
        let deletionCount = 0;

        try {
            // Itererer over BEGGE samlingene (med korrigert ID)
            for (const collectionId of TEST_COLLECTION_IDS) {
                
                // Hent ALLE eksisterende mål (finner nå "root-epic" korrekt)
                const existingGoals = await api.goal.getAll(scope.id, collectionId); 
                
                if (existingGoals.length > 0) {
                    console.log(`Fant ${existingGoals.length} mål i ${collectionId}. Sletter...`);
                    
                    const deletePromises = existingGoals.map(goal => {
                        return api.goal.delete(scope.id, collectionId, goal.id);
                    });
                    
                    await Promise.all(deletePromises); 
                    
                    deletionCount += existingGoals.length;
                    console.log(`Vellykket slettet ${existingGoals.length} mål fra ${collectionId}.`);
                }
            }
            
        } catch (error) {
            console.error("FEIL under sletting av mål i en samling:", error);
            
        } finally {
            setIsDeleting(false);
            console.log(`--- Opprydning fullført. Totalt slettet: ${deletionCount} mål. ---`);
            return deletionCount; 
        }
    }, [scope.id, api, isDeleting]); 
    
    return { clearTestGoals, isDeleting }; 
};