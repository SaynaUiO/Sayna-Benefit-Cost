import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import PageHeader from "@atlaskit/page-header";
import { GoalTier } from "../../Models";
import Button from "@atlaskit/button";
import CrossIcon from "@atlaskit/icon/glyph/cross";
import { useTranslation } from "@forge/react";

import { Spotlight, SpotlightTransition } from "@atlaskit/onboarding";

import { GoalStructureContainer } from "../../NewGoalStructure/components/GoalStructureContainer";

export const GoalStructure = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<GoalTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;

  // Onboarding state
  const [isOnboardingCompleted, setOnboardingCompleted] =
    useState<boolean>(true);
  const [activeSpotlight, setActiveSpotlight] = useState<number>(0);

  const fetchData = async () => {
    try {
      const response = await api.goalTier.getAll(scope.id, scope.type);
      return response.reverse();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchData().then((items) => {
      if (isMounted) {
        api.onboarding
          .isOnboardingComplete()
          .then((completed: boolean) => setOnboardingCompleted(completed))
          .catch(() => {});
        setItems(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const next = () => setActiveSpotlight((prev) => prev + 1);
  const back = () => setActiveSpotlight((prev) => prev - 1);
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setOnboardingCompleted(true);
  };

  const navToEstimation = () => {
    end();
    navigate("../estimation");
  };

  // Helper for å lage spotlight-komponenter mer konsist
  const createSpotlight = (
    key: string,
    target: string,
    index: number,
    total: number,
    isLast = false
  ) => (
    <Spotlight
      key={target}
      target={target}
      actionsBeforeElement={`${index}/${total}`}
      heading={t(`onboarding.structure.${key}.title`)}
      headingAfterElement={
        <Button
          iconBefore={<CrossIcon size="small" label="close" />}
          appearance="subtle"
          onClick={end}
        />
      }
      actions={
        [
          {
            text: isLast
              ? t("onboarding.common.finish_estimation")
              : t("onboarding.common.next"),
            onClick: isLast ? navToEstimation : next,
          },
          index > 1
            ? {
                text: t("onboarding.common.back"),
                onClick: back,
                appearance: "subtle" as const,
              }
            : {
                text: t("onboarding.common.dismiss"),
                onClick: end,
                appearance: "subtle" as const,
              },
        ].filter(Boolean) as any
      }
    >
      {t(`onboarding.structure.${key}.body`)}
    </Spotlight>
  );

  const spotlights = [
    createSpotlight("welcome", "project", 1, 9),
    createSpotlight("intro", "introduction-and-help", 2, 9),
    createSpotlight("structure_info", "goal-structure", 3, 9),
    createSpotlight("purpose_input", "inline-text", 4, 9),
    createSpotlight("add_goal", "add-goal", 5, 9),
    createSpotlight("edit_delete", "edit/delete-goal", 6, 9),
    createSpotlight("cost_time", "cost/time", 7, 9),
    createSpotlight("objective_weight", "formaal-weight", 8, 9),
    createSpotlight("estimation_nav", "estimation", 9, 9, true),
  ];

  return (
    <>
      {!isOnboardingCompleted && (
        <SpotlightTransition>{spotlights[activeSpotlight]}</SpotlightTransition>
      )}
      <PageHeader>{t("nav.goal_structure")}</PageHeader>
      <GoalStructureContainer />
    </>
  );
};
