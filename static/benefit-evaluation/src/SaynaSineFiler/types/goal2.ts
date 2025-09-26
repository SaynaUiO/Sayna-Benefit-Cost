//This file defines the typescript interfaces for the goalstructure

/**
 * Interface for the raw goal data structure as received from/sent to the backend API.
 * The 'type' field is a numeric enum (GoalTierTypeEnum).
 * The 'tier' field is expected to be the string representation (e.g., "Formål").
 */

import { GoalTierTypeEnum } from "../enums/goal"; // Adjust the import path as necessar

export interface GoalCollection2 {
    id: string; 
    scopeId: string;
    name: string; 
    description: string;
    parentId?: string;
    

}

/**
 * Interface for the 'Tier' object used by the frontend GoalTierTableTree for display.
 * The 'title' field is a human-readable string.
 * The 'type' field is the numeric enum (GoalTierTypeEnum).
 */

export interface Tier2 {
    id: string;
    title: string;          // Human-readable string (e.g., "Formål", "Epic")
    name: string;           // Name of the goal
    description: string;
    status?: string;
    type?: GoalTierTypeEnum; 
    parentId?: string; 
    subtask?: Tier2[];
    tierString?: string;
    dueDate?: string;       
  }