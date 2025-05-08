import { Scope, ScopeTypeEnum } from "../models/ScopeModel";
import { getPortfoliosConnectedToAPortfolio } from "./PortfolioService";
import { getProjectsConnectedToAPortfolio } from "./ProjectService";

export const getPortfolioItems = async (portfolioId: string): Promise<Scope[]> => {
  const portfolioItems: Scope[] = []
  const portfolios = await getPortfoliosConnectedToAPortfolio(portfolioId).then((portfolios) => {
    console.debug(portfolios)
    return portfolios.map((portfolio): Scope => {
      return {
        ...portfolio,
        type: ScopeTypeEnum.PORTFOLIO
      }
    });
  });
  const projects = await getProjectsConnectedToAPortfolio(portfolioId).then((projects) => {
    console.debug(projects)
    return projects.map((project): Scope => {
      return {
        ...project,
        type: ScopeTypeEnum.PROJECT
      }
    });
  });
  return portfolioItems.concat(portfolios, projects);;
}