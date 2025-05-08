import { GoalTier } from "./GoalTierModel";

export interface IssueType extends GoalTier {}

export type IssueStatus = {
  id: string;
  name: string;
}