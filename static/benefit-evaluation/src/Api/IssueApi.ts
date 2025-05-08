import { invoke } from "@forge/bridge"
import { Issue, CostTime } from "../Models"

export const issueApi = () => {
  return {
    getAll: (): Promise<Issue[]> => {
      return invoke('fetchIssues');
    },
    getAllPreview: (): Promise<Issue[]> => {
      return invoke('fetchIssuesPreview');
    },
    setIssueCostTime: (issues: { [key: string]: CostTime }): Promise<void> => {
      return invoke('setCostTime', { issues });
    },
    resetCostTime: (): Promise<void> => {
      return invoke('resetCostTime')
    },
  }
}