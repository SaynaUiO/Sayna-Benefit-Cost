import { Result } from "@forge/api";
import { deleteHead, deleteIdFromHead, getAllIds, getNextId } from "../heads/GoalHead";
import { DAGoal, Goal, GoalTypeEnum, balancedPoints, distributedPoints } from "../models";
import { GDA } from "../dataAccess/GoalDA";
import { getGoalCollection, getSubGoalCollection } from "./GoalCollectionService";
import { getEstimationProps } from "./estimation/EstimationProps";
import { EstimationSubmit } from "./estimation/EstimationSubmit";

const queryGoalPages = async (scopeId: string, goalCollectionId: string, cursor?: string): Promise<Result<Object>[]> => {
  const { results, nextCursor } = await GDA.query(scopeId, goalCollectionId, cursor).catch((error) => {
    console.error('queryGoalPages', error);
    return { results: [], nextCursor: undefined }
  });
  if (nextCursor) {
    return results.concat(await queryGoalPages(scopeId, goalCollectionId, nextCursor));
  }
  return results;
}

export const getAllGoals = async (scopeId: string, goalCollectionId: string): Promise<Goal[]> => {
  console.log(`Getting All Goal: go-${scopeId}-${goalCollectionId}-`)
  return queryGoalPages(scopeId, goalCollectionId).then((response) => {
    return getGoalCollection(scopeId, goalCollectionId).then((goalCollection) => {
      if (goalCollection) {
        return response.map((element): Goal => {
          const goal = element.value as DAGoal;
          return {
            ...goal,
            key: getGCKey(goalCollection.name, goal.id),
            type: GoalTypeEnum.GOAL
          }
        });
      } else {
        return [];
      }
    });
  });
}

export const setDPandBP = async (scopeId: string, goalCollectionId: string, goalId: string, distributedPoints?: distributedPoints, balancedPoints?: balancedPoints) => {
  console.log(`Set DP and BP: go-${scopeId}-${goalCollectionId}-${goalId}}`)
  return getGoal(scopeId, goalCollectionId, goalId).then((goal) => {
    if (!goal) return Promise.reject('Goal not found');
    goal.distributedPoints = distributedPoints;
    goal.balancedPoints = balancedPoints;
    const updatedGoal: DAGoal = {
      ...goal
    }
    return GDA.set(scopeId, goalCollectionId, updatedGoal)
  });
}

export const setBP = async (scopeId: string, goalCollectionId: string, goalId: string, balancedPoints: balancedPoints) => {
  console.log(`Set BP: go-${scopeId}-${goalCollectionId}-${goalId}}`)
  return getGoal(scopeId, goalCollectionId, goalId).then((goal) => {
    if (!goal) return Promise.reject('Goal not found');
    goal.balancedPoints = balancedPoints;
    const updatedGoal: DAGoal = {
      ...goal
    }
    return GDA.set(scopeId, goalCollectionId, updatedGoal)
  });
}

export const setBPToAllGoals = async (goals: Goal[]) => {
  if (goals.length === 0) return; // Add a check to ensure there are goals
  console.log(goals)

  const setBPPromises = goals.map((goal) =>
    setBP(goal.scopeId, goal.goalCollectionId, goal.id, goal.balancedPoints!)
  );

  const goalCollectionPromise = getGoalCollection(goals[0].scopeId, goals[0].goalCollectionId);
  const subGoalCollectionPromise = getSubGoalCollection(goals[0].scopeId, goals[0].goalCollectionId);

  const [goalCollection, subGoalCollection] = await Promise.all([
    goalCollectionPromise,
    subGoalCollectionPromise,
    Promise.all(setBPPromises),
  ]);

  if (subGoalCollection) {
    const evaluationProps = await getEstimationProps(subGoalCollection, goalCollection);
    return EstimationSubmit(evaluationProps.mode, evaluationProps.estimationTargets, evaluationProps.upperGoals);
  }
};


export const createGoal = async (scopeId: string, goalCollectionId: string, description: string) => {
  console.log(`Create Goal: go-${scopeId}-${goalCollectionId}-`)
  return getNextId(scopeId, goalCollectionId).then((id) => {
    const goal: DAGoal = { id: id, goalCollectionId: goalCollectionId, scopeId: scopeId, description: description }
    return GDA.set(scopeId, goalCollectionId, goal);
  });
}

export const getGCKey = (goalCollectionName: string, goalId: string) => {
  const key = goalCollectionName.replace(/[^a-zA-Z]/g, '')
  return key.slice(0, 4).toUpperCase() + '-' + goalId
}

export const getGoal = async (scopeId: string, goalCollectionId: string, id: string): Promise<Goal | undefined> => {
  console.log(`Getting Goal: go-${scopeId}-${goalCollectionId}-${id}`)
  return getGoalCollection(scopeId, goalCollectionId).then((goalCollection) => {
    if (!goalCollection) {
      return undefined;
    }
    return GDA.get(scopeId, goalCollectionId, id).then((goal): Goal | undefined => {
      if (!goal) {
        return undefined;
      } else {
        return {
          ...goal,
          type: GoalTypeEnum.GOAL,
          key: getGCKey(goalCollection.name, goal.id)
        }
      }
    });
  });
}

export const updateGoal = async (scopeId: string, goalCollectionId: string, goal: Goal) => {
  console.log(`Updating Goal: go-${scopeId}-${goalCollectionId}-${goal.id}`)
  return getGoal(scopeId, goalCollectionId, goal.id).then(async (originalGoal) => {
    if (originalGoal) {
      const updatedGoal: DAGoal = {
        ...originalGoal,
        description: goal.description,
        balancedPoints: goal.balancedPoints,
        distributedPoints: goal.distributedPoints
      }
      return GDA.set(scopeId, goalCollectionId, updatedGoal);
    } else {
      return Promise.reject('Goal not found');
    }
  });
}

export const deleteGoal = async (scopeId: string, goalCollectionId: string, goalId: string) => {
  console.log(`Deleting Goal: go-${scopeId}-${goalCollectionId}-${goalId}`)
  return deleteIdFromHead(scopeId, goalCollectionId, goalId).then((response) => {
    return GDA.remove(scopeId, goalCollectionId, goalId).then(() => {
      return { ok: true };
    });
  });
}

export const flushGoals = async (scopeId: string, goalCollectionId: string) => {
  console.log(`Flushing Goals: go-${scopeId}-${goalCollectionId}-`)
  return getAllIds(scopeId, goalCollectionId).then(async (ids) => {
    for (let i = 0; i < ids.length; i++) {
      await GDA.remove(scopeId, goalCollectionId, `${ids[i]}`);
    }
    return await deleteHead(scopeId, goalCollectionId)
  });
}

export const resetAllGoalPoints = async (scopeId: string, goalCollectionId: string) => {
  console.log(`Resetting all goals: go-${scopeId}-`)
  return getAllGoals(scopeId, goalCollectionId).then(async (goals) => {
    console.log(goals)
    return Promise.all(goals.map((goal) => (
      setDPandBP(scopeId, goalCollectionId, goal.id, undefined, undefined)
    )));
  })
}