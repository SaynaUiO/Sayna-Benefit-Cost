import Resolver from "@forge/resolver";
import {  createGoalCollection, deleteGoalCollection, getAllGoalCollections, getAllGoalCollectionsByRanking, getGoalCollection, updateGoalCollection } from "../services/GoalCollectionService";
import { GoalCollection } from "../models/GoalCollectionModel";

export const goalCollectionResolver = (resolver: Resolver) => {
  //Get
  resolver.define('getGoalCollection', async ({ payload: { scopeId, id } }): Promise<GoalCollection | undefined> => {
    return await getGoalCollection(scopeId, id);
  });

  //Get All: Sayna har adda
  resolver.define('getAllGoalCollections', async ({ payload: { scopeId } }) => {
    return await getAllGoalCollections(scopeId);
  });
  
  //Create
  resolver.define('createGoalCollection', async ({ payload: { scopeId, goalCollection } }) => {
    return await createGoalCollection(scopeId, goalCollection)
  });

  //Update
  resolver.define('updateGoalCollection', async ({ payload: { scopeId, goalCollection } }) => {
    return await updateGoalCollection(scopeId, goalCollection);
  });

  //Delete
  resolver.define('deleteGoalCollection', async ({ payload: { scopeId, id } }) => {
    return await deleteGoalCollection(scopeId, id);
  });
}