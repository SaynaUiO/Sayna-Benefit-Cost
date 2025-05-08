import Resolver from "@forge/resolver";
import { GoalTier } from "../models/GoalTierModel";
import { getAllGoalTiers, getTopRankedGoalTier } from "../services/GoalTierService";

export const goalTierResolver = (resolver: Resolver) => {
  //getAll
  resolver.define('getAllGoalTiers', async ({ payload: { scopeId, scopeType } }): Promise<GoalTier[]> => {
    console.log('Resolver',`Getting all goal tiers: gc-${scopeId}-`)
    return await getAllGoalTiers(scopeId, scopeType);
  });
}