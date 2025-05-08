import { Scope, ScopeTypeEnum } from "./ScopeModel";

export const PfKey = (id: string) => {
  return `portfolio-${id}`;
}

export const PfHeadKey = () => {
  return `portfolio`;
}

//Head
export type PfHead = {
  nextId: number;
  portfolioIds: string[];
}

export type PortfolioItemIdentifier = {
  id: string;
  type: ScopeTypeEnum
}

export interface Portfolio extends Scope {
  portfolioItems: PortfolioItemIdentifier[];
}