import { ListResult } from "@forge/api";
import { Method, storageAPI } from "../api/storageAPI";
import { PfHead, PfHeadKey, PfKey, Portfolio } from "../models/PortfolioModel";

export const PfDA = {
  get: async(id: string) => {
    const key = PfKey(id);
    console.log('DA', 'Get Portfolio', key);
    return await storageAPI(Method.get, key) as Promise<Portfolio>;
  },
  set: async(portfolio: Portfolio) => {
    const key = PfKey(portfolio.id);
    console.log('DA', 'Set Portfolio', key);
    return await storageAPI(Method.set, key, portfolio) as Promise<void>;
  },
  remove: async(id: string) => {
    const key = PfKey(id);
    console.log('DA', `Delete Portfolio: ${key}`)
    return await storageAPI(Method.delete, key) as Promise<void>;
  },
  query: async(cursor?: string) => {
    const key = PfHeadKey() + '-';
    console.log('DA', `Query Portfolio: ${key}`)
    return await storageAPI(Method.query, key, undefined, cursor) as Promise<ListResult<Object>>;
  }
}

export const PfHeadDA = {
  get: async () => {
    const key = PfHeadKey();
    console.log('DA', 'Get Portfolio Head', key);
    return await storageAPI(Method.get, key) as Promise<PfHead>;
  },
  set: async(head: PfHead) => {
    const key = PfHeadKey();
    console.log('DA', 'Set Portfolio Head', key);
    return await storageAPI(Method.set, key, head) as Promise<void>
  },
  remove: async () => {
    const key = PfHeadKey();
    console.log('DA', `Delete Portfolio Head: ${key}`)
    return await storageAPI(Method.delete, key) as Promise<void>
  }
}
