import { GoalTier, GoalTierTypeEnum } from "./GoalTierModel";

export const PortfolioItems = (portfolioId: string): GoalTier => ({
  id: "-1",
  scopeId: portfolioId,
  type: GoalTierTypeEnum.PORTFOLIO_ITEM,
  name: "Portfolio Items",
  description: "",
  tier: "", //Sayna har adda
  status: "",//Sayna har adda
  parentId: "", //Sayna har adda
  dueDate: "", //Sayna har adda
})