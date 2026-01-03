import React, { useState, useEffect } from "react";
import { Box, Flex, xcss } from "@atlaskit/primitives";
import { UpperGoalContainer } from "../../Components/Estimation/Table/UpperGoalContainer";
import { EstimationTargetContextProvider } from "./EstimationTargetContext";
import { useEstimation } from "./EstimationContext";
import { EstimationUpperGoalLabel } from "../../Components/Estimation/EstimationUpperGoalLabel";
import { LoadingButton } from "@atlaskit/button";
import Button, { ButtonGroup } from "@atlaskit/button";
import PageHeader from "@atlaskit/page-header";
import Tooltip from "@atlaskit/tooltip";
import { ProgressIndicator } from "@atlaskit/progress-indicator";
import { SpotlightTarget } from "@atlaskit/onboarding";

// Import the translation hook
import { useTranslation } from "@forge/react";

export const EstimationContainer = () => {
  const { t } = useTranslation();
  const {
    estimationTargets,
    upperGoals,
    readyToSubmit,
    isSubmitting,
    onSubmit,
    pointsToDistribute,
    getUpperGoalDP,
  } = useEstimation();

  const [stepwiseTabOpen, setStepwiseTabOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stages, setStages] = useState<string[]>([]);

  useEffect(() => {
    const stagesList = upperGoals.map((upperGoal: any) => upperGoal.key);
    setStages(stagesList);
  }, [upperGoals]);

  const containerStyle = xcss({
    display: "grid",
    width: "max-content",
    position: "relative",
    gridTemplateColumns: "100%",
    maxWidth: "100%",
    border: "1px solid",
    borderColor: "color.border",
    marginBottom: "space.1000",
  });

  const HeaderGridStyle = xcss({
    gridColumn: "1",
    gridRow: "1",
    height: "100%",
  });

  const ContentGridStyle = xcss({
    gridColumn: "1",
    gridRow: "1",
  });

  let appearance: "danger" | "primary" | "warning" = "danger";
  const currentGoalId = upperGoals[activeStep]?.id;
  const currentPoints = currentGoalId ? getUpperGoalDP(currentGoalId) : 0;

  if (currentPoints === pointsToDistribute) {
    appearance = "primary";
  } else if (currentPoints < pointsToDistribute) {
    appearance = "warning";
  } else {
    appearance = "danger";
  }

  return (
    <>
      {stepwiseTabOpen && upperGoals[activeStep] && (
        <>
          <PageHeader>
            <b>{t("estimation_container.assessment_goal")}</b>{" "}
            {upperGoals[activeStep].description}
          </PageHeader>
          <div className="noMarginTop">
            <ProgressIndicator
              appearance="primary"
              selectedIndex={activeStep}
              values={stages}
            />
          </div>
        </>
      )}
      <SpotlightTarget name="estimation-table">
        <Box xcss={containerStyle}>
          {!stepwiseTabOpen && (
            <Box xcss={HeaderGridStyle}>
              <UpperGoalContainer>
                {upperGoals.map((upperGoal) => (
                  <EstimationUpperGoalLabel
                    key={`${upperGoal.id}-label`}
                    upperGoal={upperGoal}
                  />
                ))}
              </UpperGoalContainer>
            </Box>
          )}

          <Box xcss={ContentGridStyle}>
            {estimationTargets.map((target, index) => (
              <EstimationTargetContextProvider
                key={target.scope.id}
                index={index}
                simplified={stepwiseTabOpen}
                currentStep={activeStep}
              />
            ))}
          </Box>

          {stepwiseTabOpen && (
            <Flex
              xcss={xcss({
                position: "sticky",
                bottom: "48px",
                padding: "space.100",
                backgroundColor: "elevation.surface.sunken",
                zIndex: "dialog",
                borderTop: "1px solid",
                borderColor: "color.border",
                justifyContent: "flex-end",
              })}
            >
              <ButtonGroup>
                <Button
                  appearance={appearance}
                  isDisabled={currentPoints === pointsToDistribute}
                >
                  {currentPoints} / {pointsToDistribute}
                </Button>
                <Button
                  onClick={() => setActiveStep((active) => active - 1)}
                  appearance="danger"
                  isDisabled={activeStep === 0}
                >
                  {t("estimation_container.back")}
                </Button>
                <Button
                  onClick={() => setActiveStep((active) => active + 1)}
                  appearance="primary"
                  isDisabled={activeStep === stages.length - 1}
                >
                  {t("estimation_container.next")}
                </Button>
              </ButtonGroup>
            </Flex>
          )}

          <Flex
            xcss={xcss({
              position: "sticky",
              bottom: "0px",
              padding: "space.100",
              backgroundColor: "elevation.surface.sunken",
              zIndex: "dialog",
              borderTop: "1px solid",
              borderColor: "color.border",
              justifyContent: "flex-end",
            })}
          >
            <ButtonGroup>
              <Tooltip content={t("estimation_container.stepwise_tooltip")}>
                <Button
                  onClick={() =>
                    setStepwiseTabOpen((currentValue) => !currentValue)
                  }
                >
                  {t("estimation_container.stepwise_button")}
                </Button>
              </Tooltip>
              <LoadingButton
                appearance="primary"
                isDisabled={!readyToSubmit}
                isLoading={isSubmitting}
                onClick={() => {
                  onSubmit();
                }}
              >
                {t("estimation_container.save")}
              </LoadingButton>
            </ButtonGroup>
          </Flex>
        </Box>
      </SpotlightTarget>
    </>
  );
};
