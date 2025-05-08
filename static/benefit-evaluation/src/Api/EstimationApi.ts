import { invoke } from "@forge/bridge"
import { GoalCollection, EstimationTarget, EstimationProps, EstimationMode, Goal } from "../Models"

export const estimationApi = () => {
  return {
    submit: (mode: EstimationMode, estimationTargets: EstimationTarget<EstimationMode>[], upperGoals: Goal[]) => {
      return invoke('submit', { mode, estimationTargets, upperGoals })
    },
    getEstimationProps: (goalCollection: GoalCollection, upperGoalCollection: GoalCollection): Promise<EstimationProps<EstimationMode>> => {
      return invoke('getEstimationProps', { goalCollection, upperGoalCollection })
    }
  }
}