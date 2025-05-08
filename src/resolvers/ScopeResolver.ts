import Resolver from "@forge/resolver"
import { getUnconnectedScopes } from "../services/ScopeService";
import { Scope } from "../models/ScopeModel";

export const scopeResolver = (resolver: Resolver) => {
  resolver.define("getUnconnectedScopes", async (): Promise<Scope[]> => {
    return await getUnconnectedScopes();
  });
};