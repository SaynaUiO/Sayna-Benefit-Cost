import { GCHeadDA } from "../dataAccess/GoalCollectionDA";
import { GoalTier, PortfolioItems, ScopeTypeEnum } from "../models";
import { getAllGoalCollectionsByRanking, getGoalCollection } from "./GoalCollectionService";
import { getSelectedIssueType } from "./ProjectService";

export const getTopRankedGoalTier = async (scopeId: string): Promise<GoalTier | undefined> => {
  console.log(`Getting top ranked Goal Collection: gc-${scopeId}-`)
  return GCHeadDA.get(scopeId).then(async (head) => {
    if (head && head.goalCollectionIds && head.goalCollectionIds.length > 0) {
      return await getGoalCollection(scopeId, head.goalCollectionIds[0]);
    }else{
      if (scopeId.startsWith('pf')) {
        return undefined;
      }
      return getSelectedIssueType(scopeId)
    }
  });
}

export const getAllGoalTiers = async (scopeId: string, scopeType: ScopeTypeEnum): Promise<GoalTier[]> => {
  const goaltiers: GoalTier[] = await getAllGoalCollectionsByRanking(scopeId);
  if (scopeType === ScopeTypeEnum.PROJECT) {
    goaltiers.unshift(await getSelectedIssueType(scopeId));
  }else{
    goaltiers.unshift(PortfolioItems(scopeId));
  }
  return goaltiers;
}