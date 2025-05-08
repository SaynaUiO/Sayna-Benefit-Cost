import { invoke } from "@forge/bridge";
import { Scope } from "../Models/ScopeModel";

export const portfolioItemApi = () => {
  return {
    getAll : (portfolioId: string): Promise<Scope[]> => {
      return invoke("getPortfolioItems", { portfolioId });
    },
  }
}