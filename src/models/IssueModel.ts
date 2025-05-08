import { CostTime } from "./CostTimeModel";
import { balancedPoints, distributedPoints } from "./EstimationModel";
import { Goal } from "./GoalModel";
import { IssueStatus } from "./IssueTypeModel";

export const issueProperties = {
  balancedPoints: 'evaluation_points',
  distributedPoints: 'evaluation_distributedpoints',
  issueCost: 'issueCost'
}
export interface Issue extends Goal {
  status: IssueStatus;
  issueCost: CostTime;
}

export interface FetchedIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: IssueStatus;
  }
  properties: {
    evaluation_points?: balancedPoints;
    evaluation_distributedpoints?: distributedPoints;
    issueCost?: CostTime;
  }
}
export interface FetchedIssue {
  issues: FetchedIssue[];
  startAt: number;
  maxResults: number;
  total: number;
}

export interface IssueCost {
  [key: string]: CostTime
}