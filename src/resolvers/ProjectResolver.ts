import Resolver from "@forge/resolver";
import { Project, IssueStatus, IssueType } from "../models";
import { connectProjectToPortfolio, disconnectProjectToPortfolio, getProject, setSelectedIssueType, getIssueStatuses, setIssueStatuses, resetProject, getSelectedIssueType, getBudgetDetails, setBudgetDetails } from "../services/ProjectService";

export const projectResolver = (resolver: Resolver) => {
  // get
  resolver.define('getProject', async ({ context }): Promise<Project | undefined> => {
    const projectId = context.extension.project.id
    return getProject(projectId)
  });
  // conncet
  resolver.define('connectProjectToPortfolio', async ({ context, payload: { portfolioId } }) => {
    const projectId = context.extension.project.id
    return connectProjectToPortfolio(projectId, portfolioId)
  });
  // disconnect
  resolver.define('disconnectProjectToPortfolio', async ({ context }) => {
    const projectId = context.extension.project.id
    return disconnectProjectToPortfolio(projectId)
  });
  // get Selected Issue Type
  resolver.define('getSelectedIssueType', async ({ context }): Promise<IssueType> => {
    const projectId = context.extension.project.id
    return getSelectedIssueType(projectId)
  });
  // set Selected Issue Type
  resolver.define('setSelectedIssueType', async ({ context, payload: { issueTypeId } }) => {
    const projectId = context.extension.project.id
    return setSelectedIssueType(projectId, issueTypeId)
  });
  // get Selected Issue Statuses
  resolver.define('getSelectedIssueStatuses', async ({ context }): Promise<IssueStatus[]> => {
    const projectId = context.extension.project.id
    return getIssueStatuses(projectId)
  });
  // set Selected Issue Statuses
  resolver.define('setSelectedIssueStatuses', async ({ context, payload: { issueStatusesIds } }) => {
    const projectId = context.extension.project.id
    return setIssueStatuses(projectId, issueStatusesIds)
  });

  resolver.define('setBudgetDetails', async ({ context, payload: { expectedBenefit, expectedCosts, postfix } }) => {
    const projectId = context.extension.project.id
    return setBudgetDetails(projectId, expectedBenefit, expectedCosts, postfix)
  });

  resolver.define('getBudgetDetails', async ({ context }) => {
    const projectId = context.extension.project.id
    return getBudgetDetails(projectId)
  });

  // reset
  resolver.define('resetProject', async ({ context }) => {
    const projectId = context.extension.project.id
    return resetProject(projectId)
  })
}