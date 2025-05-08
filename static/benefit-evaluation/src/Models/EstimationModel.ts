import { Goal } from "./GoalModel";
import { GoalTier } from "./GoalTierModel";
import { Scope } from "./ScopeModel";

export enum EstimationMode {
  PORTFOLIO_ITEMS,
  STANDARD
}

export type PortfolioItemGoal = Goal & {
  portfolioItemPoints: number;
}

export type EstimationProps<MODE extends EstimationMode> = {
  mode: MODE
  upperGoalTier: GoalTier;
  upperGoals: Goal[];
  relation: Relation;
  pointsToDistribute: number;
  estimationTargets: EstimationTarget<MODE>[];
}

export type EstimationTarget<MODE extends EstimationMode> = {
  scope: Scope;
  goalTier: GoalTier;
  goals: MODE extends EstimationMode.PORTFOLIO_ITEMS ? PortfolioItemGoal[] : Goal[];
}

export type Relation = QualitativeRelation | WorthRelation | EffectRelation;

export type QualitativeRelation = {
  balance: false;
}

export type WorthRelation = {
  balance: true,
  method: balancedPointsEnum.MONETARY,
  total: number;
}

export type EffectRelation = {
  balance: true,
  method: balancedPointsEnum.WEIGHT,
  total: 100;
}

export enum balancedPointsEnum {
  MONETARY,
  WEIGHT
}

export type balancedPoints = Weight | Monetary;

export type Weight = {
  type: balancedPointsEnum.WEIGHT;
  value: number;
  postFix: '%';
}

export type Monetary = {
  type: balancedPointsEnum.MONETARY;
  value: number;
  postFix: string;
}

export type distributedPoints = {
  [upperGoalId: string]: number;
}