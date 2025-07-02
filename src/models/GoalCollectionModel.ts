import { GoalTier } from "./GoalTierModel";

export const GCHeadKey = (scopeId: string): string => {
  return `gc-${scopeId}`;
}

export const GCKey = (scopeId: string, goalCollectionId: string): string => {
  return `gc-${scopeId}-${goalCollectionId}`;
}

export type GCHead = {
  // nextId: number; //Remove
  goalCollectionIds: string[];
}

export type  DAGoalCollection = Omit<GoalCollection, 'type'>

export interface GoalCollection extends GoalTier {}