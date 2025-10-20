import React, { useState, useEffect } from "react";
import { Box, Flex, xcss } from "@atlaskit/primitives";
import { UpperGoalContainer } from "../../Components/Estimation/Table/UpperGoalContainer";
import { EstimationTargetContextProvider } from "./EstimationTargetContext";
import { useEstimation } from "./EstimationContext";
import { EstimationUpperGoalLabel } from "../../Components/Estimation/EstimationUpperGoalLabel";
import { LoadingButton } from "@atlaskit/button";
import Button, { ButtonGroup } from "@atlaskit/button";
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import PageHeader from "@atlaskit/page-header";
import Tooltip from "@atlaskit/tooltip";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import { ProgressIndicator } from "@atlaskit/progress-indicator";

export const EstimationContainer = () => {
  const {
    estimationTargets,
    upperGoals,
    readyToSubmit,
    isSubmitting,
    onSubmit,
  } = useEstimation();

  const [stepwiseTabOpen, setStepwiseTabOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [stages, setStages] = useState<String[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stages = upperGoals.map(
      (upperGoal: any, index: number) => upperGoal.key
    );
    setStages(stages);
  }, [upperGoals, activeStep]);

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

  const { relation, pointsToDistribute, getUpperGoalDP } = useEstimation();

  let appearance: "danger" | "primary" | "warning" = "danger";
  switch (true) {
    case getUpperGoalDP(upperGoals[activeStep].id) === pointsToDistribute:
      appearance = "primary";
      break;
    case getUpperGoalDP(upperGoals[activeStep].id) < pointsToDistribute:
      appearance = "warning";
      break;
    case getUpperGoalDP(upperGoals[activeStep].id) > pointsToDistribute:
      appearance = "danger";
      break;
  }

  return (
    <>
      {stepwiseTabOpen && (
        <>
          <PageHeader>
            <b>Goal for assessment:</b> {upperGoals[activeStep].description}
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
      <Box xcss={containerStyle}>
        {!stepwiseTabOpen && (
          <Box xcss={HeaderGridStyle}>
            <UpperGoalContainer>
              {upperGoals.map((upperGoal) => {
                return (
                  <EstimationUpperGoalLabel
                    key={`${upperGoal.id}-label`}
                    upperGoal={upperGoal}
                  />
                );
              })}
            </UpperGoalContainer>
          </Box>
        )}
        {/* ContentGrid */}
        <Box xcss={ContentGridStyle}>
          {estimationTargets.map((target, index) => {
            return (
              <EstimationTargetContextProvider
                key={target.scope.id}
                index={index}
                simplified={stepwiseTabOpen}
                currentStep={activeStep}
              />
            );
          })}
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
                isDisabled={
                  getUpperGoalDP(upperGoals[activeStep].id) ===
                  pointsToDistribute
                }
              >
                {getUpperGoalDP(upperGoals[activeStep].id)} /{" "}
                {pointsToDistribute}
              </Button>
              <Button
                onClick={() => setActiveStep((active) => active - 1)}
                appearance="danger"
                isDisabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                onClick={() => setActiveStep((active) => active + 1)}
                appearance="primary"
                isDisabled={activeStep === stages.length - 1}
              >
                Next
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
            <Tooltip content="Assign benefit points one goal at a time">
              <Button
                onClick={() =>
                  setStepwiseTabOpen((currentValue) => !currentValue)
                }
              >
                Fordel trinnvis
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
              Lagre
            </LoadingButton>
          </ButtonGroup>
        </Flex>
      </Box>
    </>
  );
};
