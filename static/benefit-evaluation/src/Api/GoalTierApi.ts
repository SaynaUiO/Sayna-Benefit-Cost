import { invoke } from "@forge/bridge"
import { ScopeTypeEnum } from "../Contexts/AppContext";
import { GoalTier } from "../Models/GoalTierModel";

export const goalTierApi = () => {
  return {
    getAll: (scopeId: string, scopeType: ScopeTypeEnum): Promise<GoalTier[]> => {
      return invoke('getAllGoalTiers', { scopeId, scopeType });
    }
  }
}