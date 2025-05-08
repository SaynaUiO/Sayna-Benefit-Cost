import { invoke } from "@forge/bridge";
import { Scope } from "../Models/ScopeModel";

export const scopeApi = () => {
  return {
    getAllUnconnected : (): Promise<Scope[]> => {
      return invoke("getUnconnectedScopes");
    },
  }
}