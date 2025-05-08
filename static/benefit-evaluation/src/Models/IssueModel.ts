import { Goal } from "./GoalModel";
import { IssueStatus } from "./IssueTypeModel";

export interface Issue extends Goal {
  status: IssueStatus;
}