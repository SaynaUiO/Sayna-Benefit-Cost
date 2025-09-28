import { Goals } from "../types/goal";


export const formatGoalID = (goal: Goals): string => {
    const tier = goal.tier; 
    const shortId = goal.id.substring(0,4).toUpperCase();
    let prefix = ""; 

    switch (tier) {
        //Benefit (Planlagte Nyttevirkninger)
        case "Samfunnsmål":
        prefix = "SAM"; 
        break; 
        
        case "Organisasjonsmål": 
        prefix = "ORG"; 
        break; 

        case "Effektmål": 
        prefix = "EFF"; 
        break; 

        //Objective (Formål)
        case "Objective": 
        prefix = "O"; 
        break; 

        //Product (Produkt)
        case "Epic": 
        prefix = "Epic"; 
        break;

        default: 
        prefix = "GOAL";

    }
    return `${prefix}-${shortId}`;
}




