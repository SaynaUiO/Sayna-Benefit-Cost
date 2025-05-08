import { EstimationMode, EstimationTarget, PortfolioItemGoal, Relation, Weight, balancedPointsEnum, Goal, GoalTypeEnum, Scope, ScopeTypeEnum } from "../../models";
import { setDPandBP } from "../GoalService";
import { setBenefitPoints, setDistributedPointsToIssue } from "../IssueService";
import { setPortfolioItemPointsToPortfolio } from "../PortfolioService";
import { setPortfolioItemPointsToProject } from "../ProjectService";
import { calculateBPandTP, getRelation, recursiveSubmit, setDistributedPoints } from "./Common/common";

export const EstimationSubmit = async (mode: EstimationMode, evaluationTargets: EstimationTarget<EstimationMode>[], upperGoals: Goal[]) => {
  console.debug(`EstimationSubmit: ${upperGoals[0].scopeId}`)

  let pointsToDistribute = 100;
  for (const estimationTarget of evaluationTargets) {
    const newPointsToDistribute = setDistributedPoints(estimationTarget.goals, upperGoals);
    if (newPointsToDistribute > pointsToDistribute) pointsToDistribute = newPointsToDistribute;
  };

  if (validateEstimation(evaluationTargets, upperGoals, pointsToDistribute)) {
    const relation = getRelation(upperGoals);
    const promises: Promise<any>[] = [];
    for (const estimationTarget of evaluationTargets) {
      if (validateTarget(estimationTarget, upperGoals)) {
        console.debug('Approved', estimationTarget.scope.name)
        if (mode === EstimationMode.PORTFOLIO_ITEMS) {
          const goals = estimationTarget.goals as PortfolioItemGoal[];
          const portfolioItemWeight = getPortfolioItemWeight(goals, upperGoals, relation, pointsToDistribute);
          promises.push(
            setPortfolioItemPoints(estimationTarget.scope, portfolioItemWeight)
              .then(async () => await setPortfolioItemGoalBP(goals, portfolioItemWeight)
                .then(async () => await recursiveSubmit(estimationTarget.goalTier))
              )
          )
        } else {
          promises.push(
            setGoalBP(estimationTarget.goals, upperGoals, relation, pointsToDistribute)
              .then(async () => await recursiveSubmit(estimationTarget.goalTier))
          )
        }
      } else {
        console.log('Not approved', estimationTarget.goalTier.name)
        if (mode === EstimationMode.PORTFOLIO_ITEMS) {
          const connectionWeight: Weight = {
            type: balancedPointsEnum.WEIGHT,
            value: 0,
            postFix: '%'
          }
          promises.push(
            setPortfolioItemPoints(estimationTarget.scope, connectionWeight)
          )
        }
      }
    }
    return await Promise.all(promises).then(async (errorMessages) => {
      for (const estimationTarget of evaluationTargets) {
        console.log(`submitted ${estimationTarget.goalTier.name}`)
      }
      return { ok: true };
    }).catch((error) => {
      console.error(error);
      return { ok: false };
    });
  }
  for (const evaluationTarget of evaluationTargets) {
    console.error(`could not submit ${evaluationTarget.goalTier.name}`)
  }
  return { ok: false };
}

const validateEstimation = (evaluationTargets: EstimationTarget<EstimationMode>[], upperGoals: Goal[], pointsToDistribute: number): boolean => {
  let validated = true
  for (const upperGoal of upperGoals) {
    if (getUpperGoalDP(evaluationTargets, upperGoal.id) !== pointsToDistribute) {
      validated = false
    }
  };
  return validated
}

const getUpperGoalDP = (evaluationTargets: EstimationTarget<EstimationMode>[], upperGoalId: string) => {
  let sum = 0;
  for (const connection of evaluationTargets)
    for (const goal of connection.goals)
      sum += goal.distributedPoints?.[upperGoalId] || 0;
  return sum;
}

const validateTarget = (evaluationTarget: EstimationTarget<EstimationMode>, upperGoals: Goal[]): boolean => {
  if (evaluationTarget.goals.length === 0) return false
  for (const goal of evaluationTarget.goals)
    for (const upperGoal of upperGoals)
      if ((goal.distributedPoints?.[upperGoal.id] || 0) > 0) return true

  return false
}

const getPortfolioItemWeight = (goals: PortfolioItemGoal[], upperGoals: Goal[], relation: Relation, pointsToDistribute: number): Weight => {
  let portfolioItemWeight = 0;
  for (const goal of goals) {
    const { bp } = calculateBPandTP(goal, upperGoals, relation, pointsToDistribute)
    goal.portfolioItemPoints = bp.value;
    portfolioItemWeight += +bp.value.toFixed(2);
  }
  return {
    type: balancedPointsEnum.WEIGHT,
    value: +portfolioItemWeight.toFixed(2),
    postFix: '%'
  }
}

const setPortfolioItemPoints = async (scope: Scope, weight: Weight) => {
  if (scope.type === ScopeTypeEnum.PORTFOLIO) {
    setPortfolioItemPointsToPortfolio(scope.id, weight)
  } else {
    setPortfolioItemPointsToProject(scope.id, weight)
  }
}

const setPortfolioItemGoalBP = async (goals: PortfolioItemGoal[], connectionWeight: Weight) => {
  const promises: Promise<any>[] = [];
  for (const goal of goals) {
    const balancedPoints: Weight = {
      type: balancedPointsEnum.WEIGHT,
      value: +(goal.portfolioItemPoints / connectionWeight.value * 100).toFixed(2) || 0,
      postFix: '%'
    };
    if (goal.type === GoalTypeEnum.ISSUE) {
      promises.push(
        setBenefitPoints(`${goal.id}`, balancedPoints),
      )
      promises.push(
        setDistributedPointsToIssue(goal.key, goal.distributedPoints!)
      )
    } else {
      promises.push(
        setDPandBP(
          goal.scopeId,
          goal.goalCollectionId,
          goal.id,
          goal.distributedPoints!,
          balancedPoints
        )
      );
    }
  }
}

const setGoalBP = async (goals: Goal[], upperGoals: Goal[], relation: Relation, pointsToDistribute: number) => {
  const promises: Promise<any>[] = [];
  for (const goal of goals) {
    const balancedPoints = calculateBPandTP(goal, upperGoals, relation, pointsToDistribute).bp
    if (goal.type === GoalTypeEnum.ISSUE) {
      promises.push(
        setBenefitPoints(`${goal.id}`, balancedPoints),
      )
      promises.push(
        setDistributedPointsToIssue(goal.key, goal.distributedPoints!)
      )
    } else {
      promises.push(
        setDPandBP(
          goal.scopeId,
          goal.goalCollectionId,
          goal.id,
          goal.distributedPoints!,
          balancedPoints
        )
      );
    }
  }
  return await Promise.all(promises).then(async () => {
    console.log(`submitted connections ${upperGoals[0].scopeId}`)
    return { ok: true };
  }).catch((error) => {
    console.error(error);
    return { ok: false };
  })
}