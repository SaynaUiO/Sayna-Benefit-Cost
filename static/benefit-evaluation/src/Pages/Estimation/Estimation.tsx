import React, { useEffect, useMemo, useState } from "react";
import { SelectGoalCollections } from "../../Components/Estimation/SelectGoalCollections";
import { Loading } from "../../Components/Common/Loading";
import Button from "@atlaskit/button";
import EmptyState from "@atlaskit/empty-state";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import PageHeader from "@atlaskit/page-header";
import { EstimationContainer } from "./EstimationContainer";
import { EstimationContextProvider } from "./EstimationContext";
import { GoalTier, EstimationMode, EstimationProps } from "../../Models";
import { Spotlight, SpotlightTransition } from "@atlaskit/onboarding";
import CrossIcon from "@atlaskit/icon/glyph/cross";
import { useTranslation } from "@forge/react";

export const Estimation = () => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [goalTier, setGoalTier] = useState<GoalTier>();
  const [upperGoalTier, setUpperGoalTier] = useState<GoalTier>();
  const [estimationProps, setEstimationProps] =
    useState<EstimationProps<EstimationMode>>();
  const [error, setError] = useState<string>();

  const navigate = useNavigate();
  const [scope] = useAppContext();
  const api = useAPI();

  // Onboarding State
  const [activeSpotlight, setActiveSpotlight] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (goalTier && upperGoalTier) {
      setEstimationProps(undefined);
      setLoading(true);
      api.estimation
        .getEstimationProps(goalTier, upperGoalTier)
        .then((response) => {
          if (isMounted) setEstimationProps(response);
          setLoading(false);
        })
        .catch((err) => {
          setError(
            typeof err.message === "string" ? err.message : "generic_error"
          );
          setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [goalTier, upperGoalTier]);

  // Onboarding Logic
  useEffect(() => {
    api.onboarding.isOnboardingComplete().then((completed: boolean) => {
      if (!completed) setActiveSpotlight(0);
    });
  }, [api]);

  const next = () =>
    setActiveSpotlight((prev) => (prev !== null ? prev + 1 : null));
  const back = () =>
    setActiveSpotlight((prev) => (prev !== null ? prev - 1 : null));
  const end = () => {
    api.onboarding.setOnboardingComplete(true);
    setActiveSpotlight(null);
  };

  const navToAnalysis = () => {
    end();
    navigate("../analysis");
  };

  const displayError = useMemo(() => {
    if (error && goalTier && upperGoalTier) {
      const missingTierName = error.includes(upperGoalTier.name)
        ? upperGoalTier.name
        : error.includes(goalTier.name)
        ? goalTier.name
        : null;

      if (missingTierName) {
        return (
          <EmptyState
            header={t("estimation.empty_state.no_goals_header").replace(
              "{{name}}",
              missingTierName
            )}
            description={t("estimation.empty_state.description")}
            headingLevel={2}
            primaryAction={
              <Button
                appearance="primary"
                onClick={() => navigate("../goal-structure")}
              >
                {t("estimation.empty_state.button")}
              </Button>
            }
          />
        );
      }
    }
    return <EmptyState header={t("estimation.empty_state.header")} />;
  }, [error, goalTier, upperGoalTier, t, navigate]);

  // Spotlight Helper
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
      heading={t(`onboarding.estimation.${key}.title`)}
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
              ? t("onboarding.common.finish_analysis")
              : t("onboarding.common.next"),
            onClick: isLast ? navToAnalysis : next,
          },
          index > 10
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
      {t(`onboarding.estimation.${key}.body`)}
    </Spotlight>
  );

  const spotlights = [
    createSpotlight("relation", "relation", 10, 12),
    createSpotlight("distribute", "estimation-table", 11, 12),
    createSpotlight("analysis_nav", "analysis", 12, 12, true),
  ];

  return (
    <>
      {activeSpotlight !== null && (
        <SpotlightTransition>{spotlights[activeSpotlight]}</SpotlightTransition>
      )}
      <PageHeader
        bottomBar={
          <SelectGoalCollections
            isDisabled={isLoading}
            onChange={(value) => {
              const { goalTier, upperGoalTier } = value.value;
              setGoalTier(goalTier);
              setUpperGoalTier(upperGoalTier);
            }}
          />
        }
      >
        {t("nav.estimation")}
      </PageHeader>

      {error ? (
        displayError
      ) : (
        <>
          {estimationProps && (
            <EstimationContextProvider estimationProps={estimationProps}>
              <EstimationContainer />
            </EstimationContextProvider>
          )}
          {isLoading && <Loading />}
        </>
      )}
    </>
  );
};
