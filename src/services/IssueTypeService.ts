import { route } from "@forge/api";
import { requestAPI } from "../api/requestAPI";
import { getSelectedIssueType } from "./ProjectService";
import { IssueType, IssueStatus, GoalTierTypeEnum } from "../models";

export const getIssueType = async (projectId: string, IssueTypeId: string): Promise<IssueType> => {
  console.log('IssueTypeService: ', 'Get Issue Type By Id: ', projectId)
  const Route = route`/rest/api/3/project/${projectId}/statuses`
  return requestAPI.get(Route).then((response) => {
    const issueType: IssueType = response.find((issueType: any) => issueType.id === IssueTypeId);
    return {
      ...issueType,
      scopeId: projectId,
      type: GoalTierTypeEnum.ISSUE_TYPE
    };
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}

export const getAllIssueTypes = async (projectId: string): Promise<IssueType[]> => {
  console.log('IssueTypeService: ', 'Get All Issue Types', projectId)
  const Route = route`/rest/api/3/project/${projectId}/statuses`
  return requestAPI.get(Route).then((response) => {
    const issueTypes: IssueType[] = response.map((issueType: any) => ({
      id: issueType.id,
      name: issueType.name
    }))
    return issueTypes;
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
};

export const getIssueStatusesById = async (projectId: string, IssueStatusesIds: string[]): Promise<IssueStatus[]> => {
  console.log('IssueTypeService: ', 'Get All Issue Statuses', projectId)
  const Route = route`/rest/api/3/project/${projectId}/statuses`
  return getSelectedIssueType(projectId).then((IssueTypeId) => {
    return requestAPI.get(Route).then((response) => {
      const issueStatuses = response.find((issueType: any) => issueType.id === IssueTypeId.id).statuses;
      return issueStatuses.filter((issueStatus: any) => IssueStatusesIds.includes(issueStatus.id))
        .map((issueStatus: any) => ({
          id: issueStatus.id,
          name: issueStatus.name
        }));
    }).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })
}

export const getAllIssueStatuses = async (projectId: string): Promise<IssueStatus[]> => {
  console.log('IssueTypeService: ', 'Get All Issue Statuses', projectId)
  const Route = route`/rest/api/3/project/${projectId}/statuses`
  return getSelectedIssueType(projectId).then((IssueTypeId) => {
    return requestAPI.get(Route).then((response) => {
      const issueStatuses = response.find((issueType: any) => issueType.id === IssueTypeId.id).statuses;
      return issueStatuses.map((issueStatus: any) => ({
        id: issueStatus.id,
        name: issueStatus.name
      }));
    }).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })
}