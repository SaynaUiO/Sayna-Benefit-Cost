import { Scope, ScopeTypeEnum } from "../models/ScopeModel";
import { getUnconnectedPortfolios } from "./PortfolioService";
import { getUnconnectedProjects } from "./ProjectService";
import { resetIssues } from "./IssueService";
import { resetAllGoalPoints } from "./GoalService";
import { getTopRankedGoalTier } from "./GoalTierService";

export const getUnconnectedScopes = async (): Promise<Scope[]> => {
  const unconnected: Scope[] = []
  const unconnectedPortfolios = await getUnconnectedPortfolios().then((portfolios) => {
    return portfolios.map((portfolio): Scope => {
      return {
        ...portfolio,
        type: ScopeTypeEnum.PORTFOLIO
      }
    });
  });
  const unconnectedProjects = await getUnconnectedProjects().then((projects) => {
    return projects.map((project): Scope => {
      console.log(project)
      return {
        ...project,
        type: ScopeTypeEnum.PROJECT
      }
    });
  });
  return unconnected.concat(unconnectedPortfolios, unconnectedProjects);;
}

export const resetPointsTopRankedGoalCollection = async (scopeId: string) => {
  console.log(`Reset Points Top Ranked Goal Collection: ${scopeId}`)
  return getTopRankedGoalTier(scopeId).then(async (goalCollection) => {
    if (goalCollection === undefined) {
      return
    } else if (goalCollection.name === 'epics') {
      return resetIssues(scopeId)
    } else {
      return resetAllGoalPoints(scopeId, goalCollection.id)
    }
  });
}