export enum GoalTierTypeEnum {
  GOAL_COLLECTION,
  PORTFOLIO_ITEM,
  ISSUE_TYPE,

  FORMAAL,
  NYTTEVIRKNING,
  PRODUKT,
  EPIC,
}

export interface GoalTier {
  id: string;
  scopeId: string;
  type: GoalTierTypeEnum;
  name: string;
  description: string;
  status: string; //Sayna har adda
  tier?: string; //Sayna har adda 
  parentId?: string; //Sayna har adda 
  dueDate?: string; //Sayna har adda
  /* monetaryValue: boolean; */
}

//Ny
export interface GC2 {
  id: string; 
  scopeId: string;
  parentId?: string;
  name: string; 
  description: string;

  //Categories: 
  goalType: 'Objective' | 'Benefit' | 'Product'
  tier: string //samfunnsmål, epic etc..

  //Benefit fields:
  weight?: number;

  //Product fields: 
  timeEstimate?: number; 
  costEstimate?: number;
}

//Kanskje ikke bruke dette? 