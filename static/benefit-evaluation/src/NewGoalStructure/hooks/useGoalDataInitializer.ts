import { useEffect, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";


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
                console.log("Goal-initialisering fullført (Seeding er fjernet).");

                setInitialized(true); 
            } catch (error) {
                console.error("FEIL UNDER INITIALISERING:", error);
                setInitialized(true);
            }
        };

        completeInitialization();
        
    }, [scope.id, api]); 

    return { initialized };
};