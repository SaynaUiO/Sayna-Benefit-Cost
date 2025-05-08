import { EstimationMode, Relation, Weight, balancedPointsEnum, Goal, GoalTier, GoalTierTypeEnum } from "../../../models";
import { getSubGoalCollection } from "../../GoalCollectionService";
import { getEstimationProps } from "../EstimationProps";
import { EstimationSubmit } from "../EstimationSubmit";

export const calculateBPandTP = (goal: Goal, upperGoals: Goal[], relation: Relation, pointsToDistribution: number): { tp: number, bp: Weight } => {
  console.log(`calculateBPandTP: ${upperGoals.length}`)
  let totalPoints = 0;
  let balancedPoints: Weight = { type: balancedPointsEnum.WEIGHT, value: 0, postFix: '%' };
  upperGoals.forEach(upperGoal => {
    if (relation.balance) {
      if (relation.method === balancedPointsEnum.WEIGHT) {
        balancedPoints.value += +(
          (goal.distributedPoints![upperGoal.id] *
            upperGoal.balancedPoints!.value!) /
          100
        ).toFixed(2)
      } else {
        balancedPoints.value += +(
          goal.distributedPoints![upperGoal.id] *
          (upperGoal.balancedPoints!.value / relation.total!)
        ).toFixed(2)
      }
    }
    totalPoints += goal.distributedPoints![upperGoal.id];
  });
  if (!relation.balance) {
    balancedPoints.value = +(
      (totalPoints / (pointsToDistribution * upperGoals.length)) *
      100
    ).toFixed(2)
  }
  return { tp: totalPoints, bp: balancedPoints };
};

export const setDistributedPoints = (goals: Goal[], upperGoals: Goal[]) => {
  console.log(`setTotalPoints: ${goals.length}, ${upperGoals.length}`)
  let pointsToDistribute = 100;
  upperGoals.forEach(upperGoal => {
    let totalPoints = 0;
    goals.forEach(goal => {
      if (!goal.distributedPoints) goal.distributedPoints = {};
      if (!goal.distributedPoints[upperGoal.id]) {
        goal.distributedPoints[upperGoal.id] = 0;
      }
      if (!goal.balancedPoints) goal.balancedPoints = { type: balancedPointsEnum.WEIGHT, value: 0, postFix: '%' };
      totalPoints += goal.distributedPoints[upperGoal.id];
    });
    if (totalPoints > pointsToDistribute) pointsToDistribute = totalPoints
  });
  return pointsToDistribute;
}

export const getRelation = (upperGoals: Goal[]): Relation => {
  console.log(`getRelation: go-${upperGoals[0].scopeId}-${upperGoals[0].goalCollectionId}-${upperGoals[0].id}`)
  let weight = true;
  let monetary = true;
  let totalValue = 0;

  for (const upperGoal of upperGoals) {
    if (!upperGoal.balancedPoints) {
      return { balance: false };
    } else {
      if (weight === true && upperGoal.balancedPoints.type === balancedPointsEnum.WEIGHT) {
        monetary = false;
      } else if (monetary === true && upperGoal.balancedPoints.type === balancedPointsEnum.MONETARY) {
        weight = false;
        totalValue += +upperGoal.balancedPoints.value.toFixed(2);
      } else {
        return { balance: false };
      }
    }
  };
  if (monetary) {
    return {
      balance: true,
      method: balancedPointsEnum.MONETARY,
      total: totalValue
    }
  }
  return {
    balance: true,
    method: balancedPointsEnum.WEIGHT,
    total: '100'
  };
};

export const recursiveSubmit = async (upperGoalTier: GoalTier) => {
  console.debug(`recursiveSubmit ${upperGoalTier.name} as upperGoalTier`)
  if (upperGoalTier.type === GoalTierTypeEnum.ISSUE_TYPE) return
  await getSubGoalCollection(upperGoalTier.scopeId, upperGoalTier.id).then(async (goalTier) => {
    if (goalTier) {
      return await getEstimationProps(goalTier, upperGoalTier).then(async (evaluationProps) => {
        if (evaluationProps.mode === EstimationMode.PORTFOLIO_ITEMS) {
          return await EstimationSubmit(EstimationMode.PORTFOLIO_ITEMS, evaluationProps.estimationTargets, evaluationProps.upperGoals);
        } else {
          return await EstimationSubmit(EstimationMode.STANDARD, evaluationProps.estimationTargets, evaluationProps.upperGoals);
        }
      })
    }
  })
}