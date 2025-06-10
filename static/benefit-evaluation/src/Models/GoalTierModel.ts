export enum GoalTierTypeEnum {
  GOAL_COLLECTION,
  PORTFOLIO_ITEM,
  ISSUE_TYPE,

  //Nye  GoalTier Types
  FORMAAL,
  NYTTEVIRKNING,
  PRODUKT,
  EPIC
}

export interface GoalTier {
  id: string;
  scopeId: string;
  type: GoalTierTypeEnum;
  name: string;
  description: string;
  tier?: string //Sayna har adda
  status: string //Sayna har adda
  parentId?: string //Sayna har adda
  /* monetaryValue: boolean; */
}