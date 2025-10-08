import { invoke } from "@forge/bridge"
import { GoalCollection, Goal } from "../Models"

export const goalCollectionApi = () => {
  return {
    get: (scopeId: string, id: string): Promise<GoalCollection> => {
      return invoke("getGoalCollection", { scopeId: scopeId, id: id });
    },
    //Sayna har adda
    getAll: (scopeId: string): Promise<GoalCollection[]> => {
      return invoke("getAllGoalCollections", { scopeId });
    },
    create: (scopeId: string, goalCollection: GoalCollection) => {
      return invoke("createGoalCollection", { scopeId: scopeId, goalCollection: goalCollection });
    },
    update: (scopeId: string, goalCollection: GoalCollection) => {
      return invoke("updateGoalCollection", { scopeId: scopeId, goalCollection: goalCollection });
    },
    delete: (scopeId: string, id: string) => {
      return invoke("deleteGoalCollection", { scopeId: scopeId, id: id });
    },
    changeRanking: (scopeId: string, id1: string, id2: string) => {
      return invoke("changeGoalCollectionRanking", { scopeId: scopeId, id1: id1, id2: id2 });
    },
  }
}
