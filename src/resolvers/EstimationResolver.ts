import Resolver from "@forge/resolver";
import { EstimationMode, EstimationProps } from "../models/EstimationModel";
import { getEstimationProps } from "../services/estimation/EstimationProps";
import { EstimationSubmit } from "../services/estimation/EstimationSubmit";

export const estimationResolver = (resolver: Resolver) => {
  resolver.define("submit", async ({ payload: { mode, estimationTargets, upperGoals } }) => {
    return await EstimationSubmit(mode, estimationTargets, upperGoals);
  });
  resolver.define("getEstimationProps", async ({ payload: { goalCollection, upperGoalCollection } }): Promise<EstimationProps<EstimationMode>> => {
    return await getEstimationProps(goalCollection, upperGoalCollection);
  });
};