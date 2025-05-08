import { requestAPI } from "../api/requestAPI";
import { getIssueStatuses, getSelectedIssueType } from "./ProjectService";
import { route, startsWith } from "@forge/api";
import { balancedPoints, distributedPoints, IssueStatus, IssueType, issueProperties, FetchedIssue, Issue, IssueCost, CostTime, GoalTypeEnum } from "../models";
import { storage } from '@forge/api'

const queryIssues = async (projectId: string, issueTypeId: string, issueStatuses: IssueStatus[], preview: boolean, page?: string) => {
  console.log('iService', 'Query Issues')
  console.debug(issueStatuses)
  const statuses = issueStatuses.map((issueStatus) => issueStatus.id).join(' OR status = ');
  console.debug(statuses)
  const queryParams = new URLSearchParams({
    fields: "summary, subtasks, status",
    jql: (!preview) ? `project = ${projectId} AND issuetype = ${issueTypeId} AND (status = ${statuses})` : `project = ${projectId} AND issuetype = ${issueTypeId}`,
    startAt: page ? page : "0",
    properties: `${issueProperties.balancedPoints}, ${issueProperties.distributedPoints}, ${issueProperties.issueCost}`,
  });
  const Route = route`/rest/api/3/search?${queryParams}`
  return requestAPI.get(Route)
    .then((response: FetchedIssue) => response)
    .catch((error) => {
      console.error('here', error);
      return Promise.reject('Something went wrong ' + error);
    });
}

export const getAllIssues = async (projectId: string, issueTypeId: string, issueStatuses: IssueStatus[], preview: boolean, page?: string): Promise<Issue[]> => {
  console.log('iService', 'Get All Issues')
  return queryIssues(projectId, issueTypeId, issueStatuses, preview, page)
    .then(async ({ issues, startAt, maxResults, total }) => {
      const fetchedIssues: Issue[] = issues.map((issue) => ({
        ...issue,
        goalCollectionId: issueTypeId,
        scopeId: projectId,
        type: GoalTypeEnum.ISSUE,
        description: issue.fields.summary,
        status: issue.fields.status as IssueStatus,
        balancedPoints: issue.properties.evaluation_points,
        distributedPoints: issue.properties.evaluation_distributedpoints,
        issueCost: issue.properties.issueCost || { cost: 0, time: 0 }
      }));
      if (startAt + maxResults < total) {
        const page = (startAt + maxResults).toString()
        return fetchedIssues.concat(await getAllIssues(projectId, issueTypeId, issueStatuses, preview, page));
      } else {
        return fetchedIssues;
      }
    }).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    })
}

export const fetchIssuesPreview = async (projectId: string): Promise<Issue[]> => {
  const promises: { issueType: Promise<IssueType> } = {
    issueType: getSelectedIssueType(projectId)
  };
  return Promise.all([promises.issueType])
    .then(async ([issueType]) => {
      return getAllIssues(projectId, issueType.id, [] as IssueStatus[], true)
        .then((issues) => {
          return issues
        }).catch((error) => {
          console.error(error);
          return Promise.reject(error);
        })
    }
    ).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    })
}

export const fetchIssues = async (projectId: string): Promise<Issue[]> => {
  const promises: { issueType: Promise<IssueType>, issueStatuses: Promise<IssueStatus[]> } = {
    issueType: getSelectedIssueType(projectId),
    issueStatuses: getIssueStatuses(projectId)
  };
  return Promise.all([promises.issueType, promises.issueStatuses])
    .then(async ([issueType, issueStatuses]) => {
      return getAllIssues(projectId, issueType.id, issueStatuses, false)
        .then((issues) => {
          return issues
        }).catch((error) => {
          console.error(error);
          return Promise.reject(error);
        })
    }
    ).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    })
}

export const setBenefitPoints = async (issueTypeId: string, balancedPoints?: balancedPoints) => {
  console.log("Issue Service", "Set Point to Issue: ", issueTypeId)
  const propertyKey = issueProperties.balancedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.put(Route, balancedPoints)
    .catch((error) => {
      console.error(error);
      return { ok: false };
    });
}

const resetBenefitPoints = async (issueTypeId: string) => {
  console.log("Issue Service", "Reset BenefitPoints to Issue: ", issueTypeId)
  const propertyKey = issueProperties.balancedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
    .catch((error) => {
      console.error(error);
      return { ok: false };
    });
}

export const setDistributedPointsToIssue = async (issueTypeId: string, distributedPoints?: distributedPoints) => {
  console.log("Issue Service", "Set Distributed Points to Issue: ", issueTypeId)
  const propertyKey = issueProperties.distributedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.put(Route, distributedPoints)
    .catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
}

const resetDistributedPointsToIssue = async (issueTypeId: string) => {
  console.log("Issue Service", "Reset Distributed Points to Issue: ", issueTypeId)
  const propertyKey = issueProperties.distributedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
    .catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
}

export const resetIssues = async (projectId: string) => {
  return fetchIssues(projectId).then(async (issues) => {
    const promises: Promise<any>[] = [];
    for (const issue of issues) {
      promises.push(
        resetDistributedPointsToIssue(issue.id)
      )
      promises.push(
        resetBenefitPoints(issue.id)
      )
      promises.push(resetCostTime(issue.id))
    };
    return Promise.all(promises)
      .catch((error) => {
        console.error('could not reset issues');
        console.error(error);
        return Promise.reject(error);
      });
  }).catch((error) => {
    console.error('could not fetch issues');
    console.error(error);
    return { ok: false }
  });
}

export const setCostTime = async (issues: IssueCost): Promise<void> => {
  const propertyKey = issueProperties.issueCost
  const promises: Promise<any>[] = []
  for (const key in issues) {
    console.log("Issue Service", "Set Cost/Time to Issue: ", key)
    const Route = route`/rest/api/3/issue/${key}/properties/${propertyKey}`
    promises.push(requestAPI.put(Route, issues[key])
      .catch((error) => {
        console.error(error)
        return { ok: false }
      }))
  }

  Promise.all(promises)
    .catch((error) => {
      console.error(error)
      return Promise.reject(error)
    })
  return
}

const resetCostTime = async (issueTypeId: string) => {
  console.log("Issue Service", "Reset cost and time for Issue: ", issueTypeId)
  const propertyKey = issueProperties.issueCost
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`
  return requestAPI.delete(Route)
    .catch((error) => {
      console.error(error)
      return { ok: false }
    });
}

export const flushEpicCostTime = async (projectId: string): Promise<void> => {
  return fetchIssues(projectId).then(async (issues) => {
    const promises: Promise<any>[] = [];
    for (const issue of issues) {
      promises.push(
        resetCostTime(issue.id)
      )
    }
    Promise.all(promises)
      .catch((error) => {
        console.error('could not reset issue costs and times')
        console.error(error)
        return Promise.reject(error)
      })
    return
  }).catch((error) => {
    console.error('could not fetch issues')
    console.error(error)
    return
  })
}