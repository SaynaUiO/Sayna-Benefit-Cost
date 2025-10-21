// useGoalInitializer.ts

// useGoalInitializer.ts (Rensket versjon)

import { useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";

// MOCK DATA ER NÅ FJERNET!

export const useGoalInitializer = () => {
    const [scope] = useAppContext();
    const api = useAPI();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        
        const completeInitialization = async () => {
            // Sjekk om vi har scope.id og om vi allerede er initialisert
            if (!scope.id || initialized) {
                return;
            }
            
            try {
                // VIKTIG: All seeding-logikk (som brukte mockGoalData) er fjernet!
                // Nå setter vi bare statusen til initialisert.
                // Eventuell initialisering av standard Goals må nå gjøres manuelt eller fjernes.
                
                console.log("Goal-initialisering fullført (Seeding er fjernet).");

                setInitialized(true); 
            } catch (error) {
                // Feilbehandling forblir for å sikre at status settes uansett
                console.error("FEIL UNDER INITIALISERING:", error);
                setInitialized(true);
            }
        };

        completeInitialization();
        
    }, [scope.id, api]); 

    return { initialized };
};