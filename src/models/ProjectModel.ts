import { balancedPoints } from "./EstimationModel";
import { Scope } from "./ScopeModel";

export const projectPropertyKeys = {
  connectedPortfolio: "evaluation_portfolio",
  issueTypeId: "evaluation_issue_type",
  issueStatusesIds: "evaluation_issue_statuses",
  portfolioItemPoints: "evaluation_portfolio_item_points",
}

export interface Project extends Scope {
  issueTypeId?: string;
  issueStatusesIds?: string[];
}

export interface FetchedProject {
  id: string;
  key: string;
  name: string;
  description: string;
  properties: {
    evaluation_portfolio?: string;
    evaluation_issue_type?: string;
    evaluation_issue_statuses?: string[];
    evaluation_portfolio_item_points?: balancedPoints;
  }
}

export interface FetchedProjects {
  values: FetchedProject[];
  startAt: number;
  maxResults: number;
  total: number;
}