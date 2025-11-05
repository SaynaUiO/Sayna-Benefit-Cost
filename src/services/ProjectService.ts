import { requestAPI } from "../api/requestAPI";
import { storageAPI, Method } from "../api/storageAPI";
import { FetchedProjects, Project, FetchedProject, projectPropertyKeys, IssueStatus, IssueType, ScopeTypeEnum, balancedPoints } from "../models";
import { route } from "@forge/api";
import { addPortfolioItem, removePortfolioItem } from "./PortfolioService";
import { flushEpicCostTime, resetIssues } from "./IssueService";
import { getIssueStatusesById, getIssueType } from "./IssueTypeService";
import { getAllIssueTypes } from "./IssueTypeService";

const queryProject = async (page?: string) => {
  console.log('pService', 'Query Projects')
  const queryParams = new URLSearchParams({
    fields: "summary, subtasks",
    expand: "description",
    properties: `${projectPropertyKeys.issueStatusesIds}, ${projectPropertyKeys.issueTypeId}, ${projectPropertyKeys.connectedPortfolio}, ${projectPropertyKeys.portfolioItemPoints}`
  });
  const Route = route`/rest/api/3/project/search?${queryParams}`
  return requestAPI.get(Route)
    .then((response: FetchedProjects) => response)
    .catch((error) => {
      console.error('here', error);
      return Promise.reject('Something went wrong ' + error);
    });
}

export const getAllProjects = async (page?: string): Promise<Project[]> => {
  console.log('pService', 'Get All Projects')
  return queryProject(page)
    .then(async ({ values, startAt, maxResults, total }) => {
      const projects: Project[] = values.map((project): Project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        type: ScopeTypeEnum.PROJECT,
        issueTypeId: project.properties.evaluation_issue_type,
        issueStatusesIds: project.properties.evaluation_issue_statuses,
        connectedPortfolio: project.properties.evaluation_portfolio,
        portfolioItemPoints: project.properties.evaluation_portfolio_item_points
      }));
      if (startAt + maxResults < total) {
        const page = (startAt + maxResults).toString()
        return projects.concat(await getAllProjects(page));
      } else {
        return projects;
      }
    }).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    })
}

export const getProject = async (projectId: string): Promise<Project | undefined> => {
  console.log('pService', 'Get Project Details: ', projectId)
  const queryParams = new URLSearchParams({
    properties: `${projectPropertyKeys.issueStatusesIds}, ${projectPropertyKeys.issueTypeId}, ${projectPropertyKeys.connectedPortfolio}, ${projectPropertyKeys.portfolioItemPoints}`
  });
  const Route = route`/rest/api/3/project/${projectId}?${queryParams}`
  return requestAPI.get(Route).then(async (project: FetchedProject | undefined) => {
    if (!project) {
      return undefined;
    }
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      type: ScopeTypeEnum.PROJECT,
      issueTypeId: project.properties.evaluation_issue_type,
      issueStatusesIds: project.properties.evaluation_issue_statuses,
      connectedPortfolio: project.properties.evaluation_portfolio,
      portfolioItemPoints: project.properties.evaluation_portfolio_item_points
    } as Project;
  }).catch((error) => {
    console.error(error);
    return undefined;
  });
}

export const getProjectsConnectedToAPortfolio = async (portfolioId: string): Promise<Project[]> => {
  console.log('pService', 'Get Projects Connected to a Portfolio: ', portfolioId)
  return getAllProjects().then((projects) => {
    return projects.filter((project) => {
      return project.connectedPortfolio === portfolioId;
    });
  });
}

export const getUnconnectedProjects = async (): Promise<Project[]> => {
  console.log('pService', 'Get Unconnected Projects')
  return getAllProjects().then((projects) => {
    return projects.filter((project) => {
      return !project.connectedPortfolio;
    });
  });
}

export const connectProjectToPortfolio = async (projectId: string, portfolioId: string) => {
  console.log('pService', 'Connect Project to Portfolio: ', projectId, portfolioId)
  if (!portfolioId.startsWith('pf')) {
    return Promise.reject('Invalid portfolio id');
  }
  return addPortfolioItem(portfolioId, { id: projectId, type: ScopeTypeEnum.PROJECT }).then(() => {
    const propertyKey = projectPropertyKeys.connectedPortfolio;
    const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
    return requestAPI.put(Route, portfolioId)
      .catch((error) => {
        return Promise.reject(`Something went wrong ${error}`);
      });
  });
}

export const disconnectProjectToPortfolio = async (projectId: string) => {
  console.log('pService', 'Disconnect Project to Portfolio: ', projectId)
  const propertyKey = projectPropertyKeys.connectedPortfolio;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.get(Route).then((response) => {
    const portfolioId = response.value as string;
    console.log(portfolioId)
    return removePortfolioItem(portfolioId, projectId).then(() => {
      return requestAPI.delete(Route)
        .catch((error) => {
          console.error(error);
          return addPortfolioItem(portfolioId, { id: projectId, type: ScopeTypeEnum.PROJECT })
        });
    });
  })
}

export const getSelectedIssueType = async (projectId: string): Promise<IssueType> => {
  console.log('pService', 'Get Selected Issue Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueTypeId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return await requestAPI.get(Route).then(async (response) => {
    if (response) {
      return getIssueType(projectId, response.value.id)
    } else {
      return Promise.reject('No selected issue type');
    }
  }).catch((error) => {
    console.error(error);
    return Promise.reject(`Something went wrong ${error}`);
  })
};

export const setSelectedIssueType = async (projectId: string, issueTypeId: string) => {
  console.log('pService', 'Set Selected Issue Type: ', issueTypeId)
  const propertyKey = projectPropertyKeys.issueTypeId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.put(Route, { id: issueTypeId })
};

const resetSelectedIssueType = async (projectId: string) => {
  console.log('pService', 'Reset Selected Issue Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueTypeId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
}

export const getIssueStatuses = async (projectId: string): Promise<IssueStatus[]> => {
  console.log('pService', 'Get Selected Issue Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueStatusesIds;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.get(Route).then(async (response) => {
    if (!response) return []
    return getIssueStatusesById(projectId, response.value)
  }).catch(async (error) => {
    console.error(error);
    return Promise.reject(`Something went wrong ${error}`);
  })
};

export const setIssueStatuses = async (projectId: string, issueStatusesIds: string[]) => {
  console.log('pService', 'Set Selected Epic Issue Type: ', issueStatusesIds)
  const propertyKey = projectPropertyKeys.issueStatusesIds;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return await requestAPI.put(Route, issueStatusesIds)
};

const resetIssueStatuses = async (projectId: string) => {
  console.log('pService', 'Reset Selected Epic Issue Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueStatusesIds;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
}

export const setPortfolioItemPointsToProject = async (projectId: string, connectionPoints: balancedPoints) => {
  console.log('pService', 'Set Connection Points: ', projectId, connectionPoints)
  const propertyKey = projectPropertyKeys.portfolioItemPoints;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.put(Route, connectionPoints)
}

export const setBudgetDetails = async (projectId: string, expectedBenefit: number, expectedCosts: number, postfix: string) => {
  console.log('pService', 'setBudgetDetails', { expectedBenefit, expectedCosts, postfix })
  return await storageAPI(Method.set, `budget-${projectId}`, { expectedBenefit, expectedCosts, postfix })
}

export const getBudgetDetails = async (projectId: string) => {
  const budget = await storageAPI(Method.get, `budget-${projectId}`)
  console.log('pService', 'getBudgetDetails', budget)
  if (budget !== undefined) {
    if (budget.expectedBenefit === undefined) budget.expectedBenefit = 0
    if (budget.expectedCosts === undefined) budget.expectedCosts = 0
    if (budget.postfix === undefined) budget.postfix = '$'
  }

  return budget || { expectedBenefit: 0, expectedCosts: 0, postfix: '$' }
}

export const resetProject = async (projectId: string) => {
  console.log('pService', 'Reset Project: ', projectId)
  return await resetIssues(projectId).then(() => {
    const promises = [
      resetSelectedIssueType(projectId).catch((_) => {
        console.error('Could not reset Selected Issue Type');
      }),
      resetIssueStatuses(projectId).catch((_) => {
        console.error('Could not reset Issue Statuses');
      }),
      disconnectProjectToPortfolio(projectId).catch((_) => {
        console.error('Could not disconnect Project to Portfolio');
      }),
    ]
    return Promise.resolve(promises)
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}