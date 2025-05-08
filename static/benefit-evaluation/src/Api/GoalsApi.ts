import { invoke } from "@forge/bridge";
import { Goal } from "../Models/GoalModel";

export const goalApi = () => {
  return {
    getAll: (scopeId: string, goalCollectionId: string): Promise<Goal[]> => {
      return invoke('getAllGoals', { scopeId, goalCollectionId });
    },
    get: (scopeId: string, goalCollectionId: string, id: string): Promise<Goal> => {
      return invoke("getGoal", { scopeId, goalCollectionId, id });
    },
    create: (scopeId: string, goalCollectionId: string, description: string) => {
      return invoke("createGoal", { scopeId, goalCollectionId, description });
    },
    update: (scopeId: string, goalCollectionId: string, goal: Goal) => {
      return invoke("updateGoal", { scopeId, goalCollectionId, goal });
    },
    delete: (scopeId: string, goalCollectionId: string, goalId: string) => {
      return invoke("deleteGoal", { scopeId, goalCollectionId, goalId });
    },
    setAllBP: (goals: Goal[]) => {
      return invoke("setBPToAllGoals", { goals });
    },
    setAllCosts: (goals: Goal[]) => {
      return invoke("setCostToAllGoals", { goals });
    },
    resetAllPoints: (scopeId: string, goalCollectionId: string) => {
      return invoke("resetAllGoalPoints", { scopeId, goalCollectionId });
    },
  }
}
