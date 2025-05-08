import { GHeadDA } from "../dataAccess/GoalDA";


export const getNextId = async (scopeId: string, goalCollectionId: string): Promise<string> => {
  console.log(`Get Next Goal id: go-${scopeId}-${goalCollectionId}-`)
  return GHeadDA.get(scopeId, goalCollectionId).then((head) => {
    const goalIds = head && head.goalIds ? head.goalIds : [];
    const id = head && head.nextId ? head.nextId : 1;
    goalIds.push(`${id}`);
    GHeadDA.set(scopeId, goalCollectionId, { nextId: id + 1, goalIds: goalIds })
    return `${id}`;
  });
}

export const deleteIdFromHead = async (scopeId: string, goalCollectionId: string, id: string): Promise<{ok: boolean}> => {
  console.log(`Delete Goal from Head: go-${scopeId}-${goalCollectionId}-${id}`)
  return GHeadDA.get(scopeId, goalCollectionId).then((head) => {
    if (!head || !head.goalIds) {
      return {ok: false};
    }
    const goalIds = head.goalIds;
    const index = goalIds.indexOf(id);
    if (index > -1) {
      goalIds.splice(index, 1);
    }
    return GHeadDA.set(scopeId, goalCollectionId, { nextId: head.nextId, goalIds: goalIds }).then(() => {
      return {ok: true};
    });
  })
}

export const getAllIds = async (scopeId, goalCollectionId: string): Promise<string[] | []> => {
  console.log(`Get All Goal ids: go-${scopeId}-${goalCollectionId}`)
  return GHeadDA.get(scopeId, goalCollectionId).then((response) => {
    if (!response) {
      return [];
    }
    return response.goalIds;
  });
}

export const deleteHead = async (scopeId: string, goalCollectionId: string): Promise<{ok: boolean}> => {
  console.log(`Delete Goal Head: go-${scopeId}-${goalCollectionId}`)
  return GHeadDA.remove(scopeId, goalCollectionId).then(() => {
    return {ok: true};
  });
}