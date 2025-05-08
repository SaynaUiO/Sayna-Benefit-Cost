import { startsWith, storage } from "@forge/api";

export enum Method {
  get,
  set,
  delete,
  query
}

export const storageAPI = async (method: Method, key: string, value?: any, cursor?: string) => {
  switch (method) {
    case Method.get:
      return await storage.get(key)
        .catch((error) => {
          console.error(key, error);
          return Promise.reject(error);
        });
    case Method.set:
      return await storage.set(key, value)
        .catch((error) => {
          console.error(key, error);
          return Promise.reject(error);
        });
    case Method.delete:
      return await storage.delete(key)
        .catch((error) => {
          console.error(key, error);
          return Promise.reject(error);
        });
    case Method.query:
      if (cursor) {
        return await storage.query()
          .where('key', startsWith(key))
          .limit(20)
          .cursor(cursor)
          .getMany()
          .catch((error) => {
            console.error(key, error);
            return Promise.reject(error);
          });
      } else {
        return await storage.query()
          .where('key', startsWith(key))
          .limit(20)
          .getMany()
          .catch((error) => {
            console.error(key, error);
            return Promise.reject(error);
          });
      }
    default:
      return Promise.reject('Method not implemented');
  }
}