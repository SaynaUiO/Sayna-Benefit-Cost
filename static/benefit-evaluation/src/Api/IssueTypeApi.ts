import { invoke } from "@forge/bridge";
import { IssueStatus, IssueType } from "../Models/IssueTypeModel";

export const issueTypeApi = () => {
  return {
    getAllIssueTypes: (): Promise<IssueType[]> => {
      return invoke('getIssueTypes');
    },
    getAllIssueStatuses: (): Promise<IssueStatus[]> => {
      return invoke('getIssueStatuses');
    }
  }
}