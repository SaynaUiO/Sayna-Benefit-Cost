import Resolver from "@forge/resolver"
import { fetchIssues, fetchIssuesPreview, flushEpicCostTime, setCostTime } from "../services/IssueService"
import { Issue, CostTime } from "../models"

export const issueResolver = (resolver: Resolver) => {
  //getAll
  resolver.define('fetchIssues', async ({ context }): Promise<Issue[]> => {
    const projectId = context.extension.project.id
    return fetchIssues(projectId)
  })
  //getAllPreview
  resolver.define('fetchIssuesPreview', async ({ context }): Promise<Issue[]> => {
    const projectId = context.extension.project.id
    return fetchIssuesPreview(projectId)
  })
  // Set costs
  resolver.define('setCostTime', async ({ payload: { issues } }): Promise<void> => {
    return setCostTime(issues)
  })
  // Reset costs and time
  resolver.define('resetCostTime', async ({ context }): Promise<void> => {
    const projectId = context.extension.project.id
    return flushEpicCostTime(projectId)
  })
}
