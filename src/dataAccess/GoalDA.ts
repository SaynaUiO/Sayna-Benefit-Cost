import { ListResult } from "@forge/api"
import { GHead, GHeadKey, GKey, DAGoal } from "../models/GoalModel"
import { storageAPI } from "../api/storageAPI";

enum Method {
  get,
  set,
  delete,
  query
}

export const GDA = {
  get: (scopeId: string, goalCollectionId: string, id: string): Promise<DAGoal | undefined> => {
    const key = GKey(scopeId, goalCollectionId, id);
    console.log('DA', 'Get Goal', key);
    return storageAPI(Method.get, key);
  },
  set: (scopeId: string, goalCollectionId: string, goal: DAGoal) => {
    const key = GKey(scopeId, goalCollectionId, goal.id);
    console.log('DA', 'Set Goal', key)
    return storageAPI(Method.set, key, goal) as Promise<void>;
  },
  remove: (scopeId: string, goalCollectionId: string, id: string) => {
    const key = GKey(scopeId, goalCollectionId, id);
    console.log('DA', `Delete Goal: ${key}`)
    return storageAPI(Method.delete, key) as Promise<void>;
  },
  query: (scopeId: string, goalCollectionId: string, cursor?: string) => {
    const queryKey = GHeadKey(scopeId, goalCollectionId) + '-';
    console.log('DA', `Query Goal: ${queryKey}`)
    return storageAPI(Method.query, queryKey, undefined, cursor) as Promise<ListResult<Object>>;
  }
}

export const GHeadDA = {
  get: (scopeId: string, goalCollectionId: string) => {
    const key = GHeadKey(scopeId, goalCollectionId);
    console.log('DA', 'Get Goal Head', key);
    return storageAPI(Method.get, key) as Promise<GHead | undefined>;
  },
  set: (scopeId: string, goalCollectionId: string, head: GHead) => {
    const key = GHeadKey(scopeId, goalCollectionId);
    console.log('DA', 'Set Goal Head', key);
    return storageAPI(Method.set, key, head) as Promise<void>
  },
  remove: (scopeId: string, goalCollectionId: string) => {
    const key = GHeadKey(scopeId, goalCollectionId);
    console.log('DA', `Delete Goal Head: ${key}`)
    return storageAPI(Method.delete, key) as Promise<void>
  }
}