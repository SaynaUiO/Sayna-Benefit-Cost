import { GCHeadDA } from "../dataAccess/GoalCollectionDA";

//Head
export const getNextId = async (scopeId: string): Promise<string> => {
  console.log(`Get Next Goal Collection id: gc-${scopeId}-`)
  return GCHeadDA.get(scopeId).then((head) => {
    const id = head ? head.nextId : 0;
    const goalCollectionIds = head ? head.goalCollectionIds : [];
    goalCollectionIds.push(`${id}`);
    GCHeadDA.set(scopeId, { nextId: id + 1, goalCollectionIds: goalCollectionIds })
    return `${id}`;
  });
}

export const deleteIdFromHead = async (scopeId: string, id: string): Promise<{ok: boolean}> => {
  console.log(`Delete Goal Collection from Head: ${id}`)
  return GCHeadDA.get(scopeId).then(async (response) => {
    if (!response) {
      return {ok: false};
    }
    const goalCollectionIds = response.goalCollectionIds;
    try {
      const index = goalCollectionIds.indexOf(id);
      if (index > -1) {
        goalCollectionIds.splice(index, 1);
      }
      await GCHeadDA.set(scopeId, { nextId: response.nextId, goalCollectionIds: goalCollectionIds })
      return {ok: true};
    } catch (error) {
      console.log(error)
      return {ok: false};
    }
  })
}

export const getAllIds = async (scopeId: string): Promise<string[]> => {
  console.log(`Get All Goal Collection ids: gc-${scopeId}-`)
  return GCHeadDA.get(scopeId).then((response) => {
    if (response) {
      return response.goalCollectionIds;
    }else{
      return [];
    }
  });
}