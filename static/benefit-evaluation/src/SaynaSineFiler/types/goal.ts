//This file defines the typescript interfaces for the goalstructure

/**
 * Interface for the raw goal data structure as received from/sent to the backend API.
 * The 'type' field is a numeric enum (GoalTierTypeEnum).
 * The 'tier' field is expected to be the string representation (e.g., "Formål").
 */

import { GoalTierTypeEnum } from "../enums/goal"; // Adjust the import path as necessar

export interface GoalCollection {
    id: string; 
    scopeId: string;
    type: number;
    name: string; 
    description: string;
    tier: string; 
    status: string;
    parentId?: string; // Optional: Parent ID for subtasks
    //Add other properties if your backend GoalCollection has more fields

}

/**
 * Interface for the 'Tier' object used by the frontend GoalTierTableTree for display.
 * The 'title' field is a human-readable string.
 * The 'type' field is the numeric enum (GoalTierTypeEnum).
 */

export interface Tier {
    id: string;
    title: string;          // Human-readable string (e.g., "Formål", "Epic")
    name: string;           // Name of the goal
    description: string;
    status?: string;
    type?: GoalTierTypeEnum; // Numeric enum from backend
    parentId?: string; 
    subtask?: Tier[];
    tierString?: string;
    // Add other properties if needed for display that are part of GoalCollection
  }