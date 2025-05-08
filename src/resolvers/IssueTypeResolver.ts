import Resolver from "@forge/resolver";
import { getAllIssueStatuses, getAllIssueTypes } from "../services/IssueTypeService";
import { IssueStatus, IssueType } from "../models/IssueTypeModel";

export const issueTypeResolver = (resolver: Resolver) => {
  
  resolver.define('getIssueTypes', async ({ context }): Promise<IssueType[]> => {
    console.log('Resolver',`Getting Issue Types`)
    const projectId = context.extension.project.id
    return getAllIssueTypes(projectId)
  });
  resolver.define('getIssueStatuses', async ({ context }): Promise<IssueStatus[]> => {
    console.log('Resolver',`Getting Issue Statuses`)
    const projectId = context.extension.project.id
    return getAllIssueStatuses(projectId)
  })
}