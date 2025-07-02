import { GCHeadDA } from "../dataAccess/GoalCollectionDA";

//Head
//Remove nextID: 
// export const getNextId = async (scopeId: string): Promise<string> => {
//   console.log(`Get Next Goal Collection id: gc-${scopeId}-`)
//   return GCHeadDA.get(scopeId).then((head) => {
//     const id = head ? head.nextId : 0;
//     const goalCollectionIds = head ? head.goalCollectionIds : [];
//     goalCollectionIds.push(`${id}`);
//     GCHeadDA.set(scopeId, { nextId: id + 1, goalCollectionIds: goalCollectionIds })
//     return `${id}`;
//   });
// }

//New function for uuid: 
export const addIdToHead = async (scopeId: string, id: string): Promise<void> => {
  console.log(`Add Goal Collection to Head: ${id}`);
  return GCHeadDA.get(scopeId).then((head) => {
    // Initialize if head doesn't exist or goalCollectionIds is null/undefined
    const goalCollectionIds = head && head.goalCollectionIds ? head.goalCollectionIds : [];

    // Only add if not already present (though UUIDs should prevent duplicates)
    if (!goalCollectionIds.includes(id)) {
      goalCollectionIds.push(id);
    }

    // --- CHANGE START (GCHeadDA.set call) ---
    // Update the head, omitting 'nextId' since it's removed from GCHead type
    return GCHeadDA.set(scopeId, { goalCollectionIds: goalCollectionIds });
    // --- CHANGE END ---
  });
};

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
      //Change: 
      // Update the head, omitting 'nextId' since it's removed from GCHead type
      await GCHeadDA.set(scopeId, { goalCollectionIds: goalCollectionIds });
      // await GCHeadDA.set(scopeId, { nextId: response.nextId, goalCollectionIds: goalCollectionIds })
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