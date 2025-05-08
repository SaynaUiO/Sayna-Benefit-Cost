import { Scope, ScopeTypeEnum } from "./ScopeModel";

export type PortfolioItemIdentifier = {
  id: string;
  type: ScopeTypeEnum
}

export interface Portfolio extends Scope {
  portfolioItems: PortfolioItemIdentifier[];
}