import Resolver from "@forge/resolver"
import { Scope } from "../models/ScopeModel";
import { getPortfolioItems } from "../services/PortfolioItemService";

export const portfolioItemResolver = (resolver: Resolver) => {
  resolver.define("getPortfolioItems", async ({ payload: { portfolioId } }): Promise<Scope[]> => {
    return await getPortfolioItems(portfolioId);
  });
};