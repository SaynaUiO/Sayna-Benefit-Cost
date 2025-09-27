//This file defines the typescript interfaces for the goalstructure

/**
 * Interface for the raw goal data structure as received from/sent to the backend API.
 * The 'type' field is a numeric enum (GoalTierTypeEnum).
 * The 'tier' field is expected to be the string representation (e.g., "Formål").
 */


export interface GoalCollection2 {
    id: string; 
    scopeId: string;
    parentId?: string;
    name: string; 
    description: string;

    //Categories: 
    goalType: 'Objective' | 'Benefit' | 'Product'
    tier: string //samfunnsmål, epic etc..

    //Benefit fields:
    weight?: number;

    //Product fields: 
    timeEstimate?: number; 
    costEstimate?: number;
}