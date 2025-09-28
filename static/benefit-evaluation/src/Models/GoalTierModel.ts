export enum GoalTierTypeEnum {
  GOAL_COLLECTION,
  PORTFOLIO_ITEM,
  ISSUE_TYPE,

  //Nye  GoalTier Types
  FORMAAL,
  NYTTEVIRKNING,
  PRODUKT,
}

export interface GoalTier {
  id: string; 
  scopeId: string;
  parentId?: string;
  name: string; 
  description: string;
  type: GoalTierTypeEnum;
  status: string;
  dueDate: string;

  //Categories: 
  goalType: ""
  tier: string //samfunnsmål, epic etc..

  //Benefit fields:
  weight?: number;

  //Product fields: 
  timeEstimate?: number; 
  costEstimate?: number;
}
