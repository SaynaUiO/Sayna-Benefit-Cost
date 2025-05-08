import { ListResult } from "@forge/api";
import { DAGoalCollection, GCHead, GCHeadKey, GCKey } from "../models/GoalCollectionModel";
import { Method, storageAPI } from "../api/storageAPI";

export const GCDA = {
  get: async (scopeId: string, goalCollectionId: string): Promise<DAGoalCollection> => {
    const key = GCKey(scopeId, goalCollectionId);
    console.log('DA', 'Get Goal Collection', key);
    return await storageAPI(Method.get, key) as Promise<DAGoalCollection>;
  },
  set: async (scopeId: string, goalCollection: DAGoalCollection) => {
    const key = GCKey(scopeId, goalCollection.id);
    console.log('DA', 'Set Goal Collection', key);
    return await storageAPI(Method.set, key, goalCollection) as Promise<void>;
  },
  remove: async (scopeId: string, goalCollectionId: string) => {
    const key = GCKey(scopeId, goalCollectionId);
    console.log('DA', 'Delete Goal Collection', key);
    return await storageAPI(Method.delete, key) as Promise<void>;
  },
  query: async (scopeId: string, cursor?: string) => {
    const key = GCHeadKey(scopeId) + '-';
    return await storageAPI(Method.query, key, undefined, cursor) as Promise<ListResult<Object>>;
  }
}

export const GCHeadDA = {
  get: async (scopeId: string) => {
    const key = GCHeadKey(scopeId);
    console.log('DA', 'Get Goal Collection Head', key);
    return await storageAPI(Method.get, key) as Promise<GCHead>;
  },
  set: async (scopeId: string, head: GCHead) => {
    const key = GCHeadKey(scopeId);
    console.log('DA', 'Set Goal Collection Head', key);
    return await storageAPI(Method.set, key, head) as Promise<void>;
  },
  remove: async (scopeId: string) => {
    const key = GCHeadKey(scopeId);
    console.log('DA', 'Delete Goal Collection Head', key);
    return await storageAPI(Method.delete, key) as Promise<void>
  }
}