import { balancedPoints } from "./EstimationModel";

export enum ScopeTypeEnum {
  PROJECT,
  PORTFOLIO
}

export interface Scope {
  id: string;
  name: string;
  description: string;
  type: ScopeTypeEnum;
  connectedPortfolio?: string;
  portfolioItemPoints?: balancedPoints;
}