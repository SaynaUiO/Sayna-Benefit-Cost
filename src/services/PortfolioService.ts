import { Result } from "@forge/api";
import { PfDA, PfHeadDA } from "../dataAccess/PortfolioDA";
import { deleteIdFromHead, getAllIds, getNextId } from "../heads/PortfolioHead";
import { ScopeTypeEnum, balancedPoints, Portfolio, PortfolioItemIdentifier } from "../models";
import { resetPointsTopRankedGoalCollection } from "./ScopeService";
import { disconnectProjectToPortfolio, getProjectsConnectedToAPortfolio } from "./ProjectService";

export const getPortfolio = async (id: string): Promise<Portfolio> => {
  return PfDA.get(id);
}

const queryPortfolioPages = async (cursor?: string): Promise<Result<Object>[]> => {
  const { results, nextCursor } = await PfDA.query(cursor)
  if (nextCursor) {
    return results.concat(await queryPortfolioPages(nextCursor));
  }
  return results;
}

export const getAllPortfolios = async (): Promise<Portfolio[]> => {
  console.log(`Getting All Portfolios`)
  return queryPortfolioPages().then((response) => {
    return response.map((element): Portfolio => {
      const goalCollection: Portfolio = element.value as Portfolio;
      return goalCollection
    })
  })
}

export const createPortfolio = async (portfolio: Portfolio) => {
  return getNextId().then((response) => {
    const id = response;
    console.log(id)
    portfolio.id = id;
    return PfDA.set(portfolio).then(() => {
      return portfolio;
    });
  });
}

export const updatePortfolio = async (id: string, portfolio: Portfolio) => {
  return getPortfolio(id).then(async (oldPortfolio) => {
    if (oldPortfolio) {
      oldPortfolio.name = portfolio.name;
      oldPortfolio.description = portfolio.description;
      await PfDA.set(portfolio);
    } else {
      return Promise.reject(`Could not fint portfolio with id ${id}`);
    }
  });
}

export const deletePortfolio = async (id: string) => {
  /* Diconnect projects and portfolios */
  const promises = [
    getProjectsConnectedToAPortfolio(id).then((projects) => {
      return Promise.all(projects.map((project) => {
        disconnectProjectToPortfolio(project.id);
      }));
    }),
    getPortfoliosConnectedToAPortfolio(id).then((portfolios) => {
      return Promise.all(portfolios.map((portfolio) => {
        disconnectPortfolioFromPortfolio(portfolio.id);
      }));
    }),
  ];
  /* Delete portfolio */
  return Promise.all(promises).then(() => {
    return PfDA.remove(id).then(async () => {
      return deleteIdFromHead(id).then(() => {
        return ""
      });
    });
  }).catch((err) => {
    console.error(err);
    return PfDA.remove(id).then(async () => {
      return deleteIdFromHead(id).then(() => {
        return ""
      });
    })
  })
}

// export const flushPortfolios = async () => {
//   return getAllIds().then(async (ids) => {
//     return PfHeadDA.remove().then(async () => {
//       Promise.all(ids.map((id) => {
//         deletePortfolio(id);
//       }));
//     });
//   });
// }

export const setPortfolioItemPointsToPortfolio = async (portfolioId: string, portfolioItemPoints: balancedPoints): Promise<void> => {
  const portfolio = await getPortfolio(portfolioId);
  if (portfolio) {
    portfolio.portfolioItemPoints = portfolioItemPoints;
    return PfDA.set(portfolio)
  } else {
    return Promise.reject(`Could not fint portfolio with id ${portfolioId}`);
  }
}

export const getPortfoliosConnectedToAPortfolio = async (portfolioId: string): Promise<Portfolio[]> => {
  return getAllPortfolios().then((portfolios) => {
    return portfolios.filter((portfolio: Portfolio) => {
      console.debug(portfolio)
      return portfolio.connectedPortfolio === portfolioId;
    });
  });
}

export const getUnconnectedPortfolios = async (): Promise<Portfolio[]> => {
  return getAllPortfolios().then((portfolios) => {
    return portfolios.filter((portfolio: Portfolio) => {
      return !portfolio.connectedPortfolio;
    });
  });
}

export const addPortfolioItem = async (portfolioId: string, portfolioItem: PortfolioItemIdentifier) => {
  return getPortfolio(portfolioId).then(async (portfolio) => {
    if (!portfolio.portfolioItems) portfolio.portfolioItems = [];
    portfolio.portfolioItems.push(portfolioItem);
    return PfDA.set(portfolio)
  });
}

export const removePortfolioItem = async (portfolioId: string, portfolioItemId: string) => {
  console.log(`Removing portfolio item ${portfolioItemId} from portfolio ${portfolioId}`)
  return getPortfolio(portfolioId).then(async (portfolio) => {
    portfolio.portfolioItems = portfolio.portfolioItems.filter((portfolioItem) => {
      return portfolioItem.id !== portfolioItemId;
    });
    return PfDA.set(portfolio)
  });
}

export const connectPortfolioToPortfolio = async (portfolioId: string, connectPortfolioId: string) => {
  console.log(`Connecting ${portfolioId} to ${connectPortfolioId}`)
  if (portfolioId === connectPortfolioId) {
    throw new Error(`Cannot connect a portfolio to itself`);
  } else {
    return addPortfolioItem(connectPortfolioId, { id: portfolioId, type: ScopeTypeEnum.PORTFOLIO }).then(() => {
      return getPortfolio(portfolioId).then((portfolio) => {
        if (portfolio) {
          portfolio.connectedPortfolio = connectPortfolioId;
          return PfDA.set(portfolio)
        }
      });
    });
  }
}

export const disconnectPortfolioFromPortfolio = async (portfolioId: string) => {
  console.log(`Disconnecting ${portfolioId}`)
  return getPortfolio(portfolioId).then((portfolio) => {
    if (portfolio.connectedPortfolio) {
      const connectPortfolioId = portfolio.connectedPortfolio;
      return removePortfolioItem(connectPortfolioId, portfolioId).then(() => {
        if (portfolio) {
          portfolio.connectedPortfolio = undefined;
          return PfDA.set(portfolio).then(async () => {
            return resetPointsTopRankedGoalCollection(portfolioId);
          });
        }
      });
    } else {
      throw new Error(`Portfolio ${portfolioId} is not connected to a portfolio`);
    }
  });
}