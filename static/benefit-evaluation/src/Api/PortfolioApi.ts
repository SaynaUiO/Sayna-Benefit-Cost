import { invoke } from "@forge/bridge";
import { Portfolio } from "../Models/PortfolioModel";

export const getPortfolio = (id: string): Promise<Portfolio> => {
  return invoke<Portfolio>("getPortfolio", { id: id });
};

export const portfolioApi = () => {
  return {
    getAll: async (): Promise<Portfolio[]> => {
      return invoke('getPortfolios');
    },
    get: (id: string): Promise<Portfolio> => {
      return invoke("getPortfolio", { id });
    },
    create: (portfolio: Portfolio) => {
      return invoke("createPortfolio", { portfolio });
    },
    update: (id: string, portfolio: Portfolio) => {
      return invoke("updatePortfolio", { id, portfolio });
    },
    delete: (id: string) => {
      return invoke("deletePortfolio", { id });
    },
    connect: (selfPortfolioId: string, connectPortfolioId: string) => {
      return invoke("connectPortfolioToPortfolio", { selfPortfolioId, connectPortfolioId });
    },
    disconnect: (portfolioId: string) => {
      return invoke("disconnectPortfolioFromPortfolio", { portfolioId });
    }
  }
}