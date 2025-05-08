import { invoke } from "@forge/bridge";
import { IssueStatus, IssueType, Project, BudgetDetails } from "../Models";

export const getProject = (projectId: string): Promise<Project | undefined> => {
  return invoke("getProject");
};

export const projectApi = () => {
  return {
    get: (projectId: string): Promise<Project> => {
      return invoke("getProject");
    },
    connect: (projectId: string, portfolioId: string) => {
      return invoke("connectProjectToPortfolio", { portfolioId });
    },
    disconnect: (projectId: string) => {
      return invoke("disconnectProjectToPortfolio");
    },
    getSelectedIssueType: (projectId: string): Promise<IssueType> => {
      return invoke("getSelectedIssueType");
    },
    setSelectedIssueType: (projectId: string, issueTypeId: string) => {
      return invoke("setSelectedIssueType", { issueTypeId });
    },
    getSelectedIssueStatuses: (projectId: string): Promise<IssueStatus[]> => {
      return invoke("getSelectedIssueStatuses");
    },
    setSelectedIssueStatuses: (projectId: string, issueStatusesIds: string[]) => {
      return invoke("setSelectedIssueStatuses", { issueStatusesIds });
    },
    setBudgetDetails: (expectedBenefit: number, expectedCosts: number, postfix: string) => {
      return invoke("setBudgetDetails", { expectedBenefit, expectedCosts, postfix });
    },
    getBudgetDetails: (): Promise<BudgetDetails> => {
      return invoke("getBudgetDetails") as Promise<BudgetDetails>;
    },
    reset: (projectId: string) => {
      return invoke("resetProject");
    }
  }
}