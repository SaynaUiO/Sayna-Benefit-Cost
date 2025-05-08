import { CostTime } from "./CostTimeModel";
import { balancedPoints, distributedPoints } from "./EstimationModel";

export enum GoalTypeEnum {
  GOAL,
  ISSUE
}

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