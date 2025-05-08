import api, { Route } from "@forge/api";

export enum Method {
  get,
  put,
  post,
  delete
}

export const requestAPI = {
  get: async (Route: Route) => {
    console.log('requestAPI', 'get', Route)
    return api.asApp().requestJira(Route, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    }).then(async (response) => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(response.status);
      }
    }).catch((error) => {
      console.error('requestAPI GET', Route.value, error);
      return Promise.reject(error);;
    });
  },
  post: async (Route: Route, body: any) => {
    console.log('requestAPI', 'post', Route)
    return api.asApp().requestJira(Route, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(response.status);
      }
    }).catch((error) => {
      console.error('requestAPI POST', Route.value, error);
      return Promise.reject(error);
    });
  },
  put: async (Route: Route, body: any): Promise<boolean> => {
    console.log('requestAPI', 'put', Route)
    return api.asApp().requestJira(Route, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    }).then((response) => {
      return response.ok
    }).catch((error) => {
      console.error('requestAPI PUT', Route.value, error);
      return Promise.reject(error);
    });
  },
  delete: async (Route: Route): Promise<boolean> => {
    console.log('requestAPI', 'delete', Route)
    return api.asApp().requestJira(Route, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      return response.status === 204
    }).catch((error) => {
      console.error('requestAPI DELETE', Route.value, error);
      return Promise.reject(error);
    });
  }
}