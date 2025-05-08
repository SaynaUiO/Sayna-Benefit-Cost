import { storage } from "@forge/api";
import Resolver from "@forge/resolver";
import { connectPortfolioToPortfolio, createPortfolio, deletePortfolio, disconnectPortfolioFromPortfolio, getAllPortfolios, updatePortfolio } from "../services/PortfolioService";

export const portfolioResolver = (resolver: Resolver) => {
  // getAll
  resolver.define('getPortfolios', async () => {
    return getAllPortfolios();
  });
  // get
  resolver.define('getPortfolio', async ({ payload: { id } }) => {
    return await storage.get(`portfolio-${id}`);
  });
  // create
  resolver.define('createPortfolio', async ({ payload: { portfolio } }) => {
    return await createPortfolio(portfolio);
  });
  // update
  resolver.define('updatePortfolio', async ({ payload: { id, portfolio } }) => {
    return await updatePortfolio(id, portfolio);
  });
  // delete
  resolver.define('deletePortfolio', async ({ payload: { id } }) => {
    return await deletePortfolio(id)
  });
  //Connect Portfolio to Portfolio
  resolver.define('connectPortfolioToPortfolio', async ({ payload: { portfolioId, connectPortfolioId } }) => {
    return await connectPortfolioToPortfolio(portfolioId, connectPortfolioId);
  });
  //Disconnect Portfolio from Portfolio
  resolver.define('disconnectPortfolioFromPortfolio', async ({ payload: { portfolioId } }) => {
    return await disconnectPortfolioFromPortfolio(portfolioId);
  });
}
