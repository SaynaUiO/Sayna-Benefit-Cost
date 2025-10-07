import { useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { Goal } from "../../Models";

// Sørg for at mockGoalData har den korrekte ID-en!
const mockGoalData = [
    // Effektmål Goals
    { collectionId: "root-effektmaal", description: "Øke kundetilfredshet med 15% innen Q4." }, // ENDRET 'mal' til 'maal'
    { collectionId: "root-effektmaal", description: "Redusere churn-rate med 5% i år." },       // ENDRET 'mal' til 'maal'
    
    // Epic Goals
    { collectionId: "root-epic", description: "Implementere ny betalingsløsning V. 2.0." },
    { collectionId: "root-epic", description: "Full overhaling av mobilappen." },
];


export const useGoalInitializer = () => {
    const [scope] = useAppContext();
    const api = useAPI();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        
        const seedGoals = async () => {
            if (!scope.id || initialized) {
                return;
            }
            
            try {
                // Sjekk databasen: Sjekk kun én samling for å se om vi er tomme
                // Bruker "root-epic" da dette var der feilen oppstod, men bruker korrigert ID for effektmål i data
                const existingGoals = await api.goal.getAll(scope.id, "root-epic"); 
                
                if (existingGoals.length === 0) {
                    
                    console.log("Starter SEKVENSIELL seeding av testmål...");
                    
                    // Løsningen: for...of tvinger ett kall om gangen
                    for (const data of mockGoalData) {
                        await api.goal.create(scope.id, data.collectionId, data.description);
                        console.log(`Opprettet: ${data.description}`);
                    }
                    
                    console.log("Sekvensiell seeding fullført.");

                } else {
                    console.log(`Testmål finnes allerede (${existingGoals.length} funnet), hopper over seeding.`);
                }

                setInitialized(true); 
            } catch (error) {
                console.error("FEIL UNDER SEEDING ELLER SJEKK:", error);
                setInitialized(true);
            }
        };

        seedGoals();
        
    }, [scope.id, initialized, api]); 

    return { initialized };
};