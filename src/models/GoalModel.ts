import { CostTime } from "./CostTimeModel";
import { balancedPoints, distributedPoints } from "./EstimationModel";

export const GHeadKey = (scopeId: string, goalCollectionId: string): string => {
  return `go-${scopeId}-${goalCollectionId}`;
}

export const GKey = (scopeId: string, goalCollectionId: string, id: string): string => {
  return `go-${scopeId}-${goalCollectionId}-${id}`;
}

export enum GoalTypeEnum {
  GOAL,
  ISSUE
}

export type GHead = {
  nextId: number;
  goalIds: string[];
}

export type DAGoal = Omit<Goal, 'key' | 'type'>

export interface Goal {
  id: string;
  key: string;
  goalCollectionId: string;
  type: GoalTypeEnum;
  scopeId: string;
  description: string;
  balancedPoints?: balancedPoints;
  distributedPoints?: distributedPoints;
  issueCost?: CostTime;
}