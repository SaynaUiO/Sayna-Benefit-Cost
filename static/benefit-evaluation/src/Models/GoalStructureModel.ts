import { ScopeTypeEnum } from "../Contexts/AppContext";
import { CostTime } from "./CostTimeModel";
import { balancedPoints } from "./EstimationModel";
import { IssueStatus } from "./IssueTypeModel";

export enum GoalTableItemTypeEnum {
  GOAL,
  ISSUE,
  SCOPE
}

export type GoalTableItem = {
  id: string;
  key: string;
  goalCollectionId: string;
  type: GoalTableItemTypeEnum;
  scopeType?: ScopeTypeEnum;
  status?: IssueStatus;
  description?: string;
  balancedPoints?: balancedPoints;
  issueCost?: CostTime;
}