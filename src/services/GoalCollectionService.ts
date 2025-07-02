import { flushGoals } from "./GoalService";
import { GCDA, GCHeadDA } from "../dataAccess/GoalCollectionDA";
import { deleteIdFromHead, getAllIds, addIdToHead} from "../heads/GoalCollectionHead";
import { GoalCollection, PortfolioItems, GoalTierTypeEnum } from "../models";
import { Result } from "@forge/api";
import { getSelectedIssueType } from "./ProjectService";


export const deleteGoalCollection = async (scopeId: string, id: string) => {
  console.log(`Delete Goal Collection: gc-${scopeId}-${id}`)
  return GCDA.remove(scopeId, id).then(() => {
    return deleteIdFromHead(scopeId, id).then((response) => {
      if (response.ok) {
        return flushGoals(scopeId, id).then((response) => {
          if (response.ok) {
            return { ok: true };
          }
          console.log(`Could not flush goals: go-${scopeId}-${id}-`)
          return { ok: false };
        });
      } else {
        console.log(`Could not delete id from head: gc-${scopeId}-${id}-`)
        return { ok: false };
      }
    })
  });
}

export const flushGoalCollections = async (scopeId) => {
  console.log(`Flush Goal Collections: gc-${scopeId}-`)
  await getAllIds(scopeId).then(async (ids) => {
    Promise.all(ids.map((id) => (
      deleteGoalCollection(scopeId, id)
    ))).then(() => {
      return GCHeadDA.remove(scopeId)
    });
  });
}

export const getGoalCollection = async (scopeId: string, id: string): Promise<GoalCollection> => {
  console.log(`Getting Goal Collection: gc-${scopeId}-${id}`)
  return GCDA.get(scopeId, id).then((goalCollection): GoalCollection => ({
    ...goalCollection,
    type: GoalTierTypeEnum.GOAL_COLLECTION,
  }))
}

export const changeRanking = async (scopeId: string, id1: string, id2: string) => {
  console.log(`Changing goal collection ranking: gc-${scopeId}-${id1} to gc-${scopeId}-${id2}'s position`)
  return GCHeadDA.get(scopeId).then((head) => {
    const ids = head.goalCollectionIds ? head.goalCollectionIds : [];
    const index = ids.indexOf(id1);
    const new_index = ids.indexOf(id2);
    if (new_index >= ids.length) {
      let k = new_index - ids.length + 1;
      while (k--) {
        ids.push('');
      }
    }
    ids.splice(new_index, 0, ids.splice(index, 1)[0]);
    // return GCHeadDA.set(scopeId, { nextId: head.nextId, goalCollectionIds: ids });
    return GCHeadDA.set(scopeId, { goalCollectionIds: ids });
  });
}

export const updateGoalCollection = async (scopeId: string, goalCollection: GoalCollection) => {
  console.log(`Updating Goal Collection: gc-${scopeId}-${goalCollection.id}`)
  return getGoalCollection(scopeId, goalCollection.id).then(async (response) => {
    goalCollection.type = GoalTierTypeEnum.GOAL_COLLECTION;
    return GCDA.set(scopeId, goalCollection)
  });
}

export const queryGoalCollectionPages = async (scopeId: string, cursor?: string): Promise<Result<Object>[]> => {
  const { results, nextCursor } = await GCDA.query(scopeId, cursor)
  if (nextCursor) {
    return results.concat(await queryGoalCollectionPages(scopeId, nextCursor));
  }
  return results;
}

export const getAllGoalCollections = async (scopeId: string, cursor?: string): Promise<GoalCollection[]> => {
  console.log(`Getting All Goal Collections: gc-${scopeId}-`)
  return queryGoalCollectionPages(scopeId).then((response) => {
    return response.map((element): GoalCollection => {
      const goalCollection: GoalCollection = element.value as GoalCollection;
      return goalCollection
    })
  })
}

export const getAllGoalCollectionsByRanking = async (scopeId: string): Promise<GoalCollection[]> => {
  console.log(`Getting All Goal Collections by ranking: gc-${scopeId}-`);
  const ids = await getAllIds(scopeId);
  if (!ids || ids.length === 0) {
    console.log('something went wrong', ids);
    return [];
  }
  const promises = ids.map(async (id) => {
    console.log(`finding gc-${scopeId}-${id}`);
    const goalCollection = await getGoalCollection(scopeId, id);
    if (!goalCollection) {
      console.log(`gc-${scopeId}-${id} not found`);
      await deleteIdFromHead(scopeId, id);
      return null;
    }
    return goalCollection;
  });
  return await Promise.all(promises).then((goalCollections) => {
    return goalCollections.filter(Boolean) as GoalCollection[]
  });
}

export const getSubGoalCollection = async (scopeId: string, goalCollectionId: string) => {
  console.log(`Getting Sub Goal Collection: gc-${scopeId}-${goalCollectionId}-`)
  if (goalCollectionId === '-1') {
    /* goalCollection is epic */
    return undefined
  } else {
    return getAllIds(scopeId).then(async (ids) => {
      console.debug(ids)
      const index = ids.indexOf(goalCollectionId);
      console.debug(index)
      if (index > 0) {
        /* goalCollection has a sub goalCollection */
        return await getGoalCollection(scopeId, ids[index - 1]);
      } else if (scopeId.startsWith('pf')) {
        return PortfolioItems(scopeId)
      };
      return getSelectedIssueType(scopeId)
    });
  }
}

// --- Keep ONLY this (the second/bottom-most) one, with the changes below: ---
export const createGoalCollection = async (scopeId: string, goalCollection: GoalCollection) => {
  console.log(`Create New Goal Collection: gc-${scopeId}-`);

  // --- START OF CHANGES ---
  // No longer use getNextId or overwrite the ID
  // The goalCollection.id already contains the UUID from the frontend.

  // Add the client-generated UUID to the head
  await addIdToHead(scopeId, goalCollection.id); // <--- NEW LINE

  // Store the goal with the UUID
  return GCDA.set(scopeId, goalCollection);
  // --- END OF CHANGES ---
};