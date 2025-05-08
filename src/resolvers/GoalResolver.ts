import Resolver from "@forge/resolver";
import { createGoal, deleteGoal, getAllGoals, getGoal, resetAllGoalPoints, setBPToAllGoals, updateGoal } from "../services/GoalService";
import { Goal } from "../models/GoalModel";

export const goalApi = (resolver: Resolver) => {
  //GetAll
  resolver.define('getAllGoals', async ({ payload: { scopeId, goalCollectionId } }): Promise<Goal[]> => {
    return getAllGoals(scopeId, goalCollectionId);
  });
  //Get
  resolver.define('getGoal', async ({ payload: { scopeId, goalCollectionId, id } }): Promise<Goal | undefined> => {
    return await getGoal(scopeId, goalCollectionId, id);
  });
  //Create
  resolver.define('createGoal', async ({ payload: { scopeId, goalCollectionId, description } }) => {
    return await createGoal(scopeId, goalCollectionId, description);
  });
  //Update
  resolver.define('updateGoal', async ({ payload: { scopeId, goalCollectionId, goal } }) => {
    return await updateGoal(scopeId, goalCollectionId, goal);
  });
  //Delete
  resolver.define('deleteGoal', async ({ payload: { scopeId, goalCollectionId, goalId } }) => {
    return await deleteGoal(scopeId, goalCollectionId, goalId)
  });
  //setAllBP
  resolver.define('setBPToAllGoals', async ({ payload: { goals } }) => {
    return setBPToAllGoals(goals);
  });
  //ResetAllPoints
  resolver.define('resetAllGoalPoints', async ({ payload: { scopeId, goalCollectionId } }) => {
    return resetAllGoalPoints(scopeId, goalCollectionId);
  });
}