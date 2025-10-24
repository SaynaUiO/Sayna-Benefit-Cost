import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import PageHeader from "@atlaskit/page-header";
import { GoalTier } from "../../Models";

import {
  Spotlight,
  SpotlightTransition,
  SpotlightTarget,
} from "@atlaskit/onboarding";

import { GoalStructureContainer } from "../../SaynaSineFiler/components/GoalStructureContainer";

export const GoalStructure = () => {
  const [items, setItems] = useState<GoalTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRankable, setRankable] = useState<boolean>(false);

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;

  const fetchData = async () => {
    return api.goalTier
      .getAll(scope.id, scope.type)
      .then((response) => {
        return response.reverse();
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setRankable(false);
    fetchData().then((items) => {
      if (isMounted) {
        api.onboarding
          .isOnboardingComplete()
          .then((completed: boolean) => {
            setOnboardingCompleted(completed);
          })
          .catch((_) => {});
        setItems(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  // * Onboarding
  const [isOnboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(true);
  const [activeSpotlight, setActiveSpotlight] = useState<null | number>(0);
  const next = () => setActiveSpotlight((activeSpotlight || 0) + 1);
  const back = () => setActiveSpotlight((activeSpotlight || 1) - 1);
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setActiveSpotlight(0);
    setOnboardingCompleted(true);
  };

  const renderActiveSpotlight = () => {
    const spotlights = [
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => end(),
            text: "Dismiss",
            appearance: "subtle",
          },
        ]}
        heading="Benefit/Cost"
        target="project"
        key="project"
      >
        Thanks for using Benefit/Cost, a brief introduction of the project pages
        will now follow.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Goal Structure"
        target="goal-structure"
        key="goal-structure"
      >
        View and administrate all the goal collections, set cost and time per
        epic and create goals. A goal structure is a layer/tier of goals, at the
        bottom you can find epics, above that you might find project goals,
        followed by company goals and so on.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Estimation"
        target="estimation"
        key="estimation"
      >
        The estimation tab is used for assigning benefit points to each task.
      </Spotlight>,
      <Spotlight
        actions={[
          {
            onClick: () => next(),
            text: "Next",
          },
          {
            onClick: () => back(),
            text: "Back",
            appearance: "subtle",
          },
        ]}
        heading="Analysis"
        target="analysis"
        key="analysis"
      >
        View an analysis of graphs and a table over all the entered values and
        sort by the preferred metric. Graphs like burndown chart, timeline
        chart.
      </Spotlight>,
      <Spotlight
        actions={[
          { onClick: () => end(), text: "OK" },
          {
            onClick: () => back(),
            text: "Go back",
            appearance: "subtle",
          },
        ]}
        heading="Restart Onboarding"
        target="restart-onboarding"
        key="restart-onboarding"
      >
        You can restart this onboarding at any time by pressing this help icon.
      </Spotlight>,
    ];

    if (activeSpotlight === null) {
      return null;
    }

    return spotlights[activeSpotlight];
  };

  return (
    <>
      {!isOnboardingCompleted && (
        <SpotlightTransition>{renderActiveSpotlight()}</SpotlightTransition>
      )}
      <PageHeader>Målstruktur</PageHeader>
      <GoalStructureContainer />
    </>
  );
};
