import { ReactNode, createContext, useContext } from "react";
import { issueApi } from "../Api/IssueApi";
import { goalCollectionApi } from "../Api/GoalCollectionApi";
import { goalTierApi } from "../Api/GoalTierApi";
import { goalApi } from "../Api/GoalsApi";
import { issueTypeApi } from "../Api/IssueTypeApi";
import { portfolioApi } from "../Api/PortfolioApi";
import { projectApi } from "../Api/ProjectApi";
import { scopeApi } from "../Api/ScopeAPI";
import { estimationApi } from "../Api/EstimationApi";
import { appApi } from "../Api/AppApi";
import { portfolioItemApi } from "../Api/PortfolioItemApi";
import { onboardingApi } from "../Api/OnboardingApi";

//sayna add:
import { goalAPI } from "../Api/GoalCollectionApi";

type ApiContextProps = {
  children: ReactNode;
};

type APIType = ReturnType<typeof fromAPI>;

const fromAPI = () => {
  return {
    app: appApi(),
    estimation: estimationApi(),
    goalCollection: goalCollectionApi(),
    //sayna add:
    goalAPI: goalAPI(),
    goalTier: goalTierApi(),
    goal: goalApi(),
    issue: issueApi(),
    issueType: issueTypeApi(),
    portfolio: portfolioApi(),
    portfolioItem: portfolioItemApi(),
    project: projectApi(),
    scope: scopeApi(),
    onboarding: onboardingApi(),
  };
};

const ApiContext = createContext<APIType>(undefined!);

const useAPI = () => {
  return useContext(ApiContext);
};

export const APIContextProvider = ({ children }: ApiContextProps) => {
  return (
    <ApiContext.Provider value={fromAPI()}>{children}</ApiContext.Provider>
  );
};

export { useAPI };
