import { IssueStatus, IssueType } from "./IssueTypeModel";
import { Scope } from "./ScopeModel";

export interface Project extends Scope {
  issueTypeId?: string;
  issueStatusesIds?: string[];
}

/* export interface Project extends Scope {
  issueTypeId?: string;
  issueStatusesIds?: string[];
} */