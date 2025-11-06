import Button, { LoadingButton } from "@atlaskit/button";
import { HelperMessage, Label } from "@atlaskit/form";
import Modal, {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@atlaskit/modal-dialog";

import { useEffect, useMemo, useState } from "react";
import { Goal, balancedPoints, balancedPointsEnum } from "../../Models";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";

import { Inline } from "@atlaskit/primitives";
import { Flex, Stack, xcss } from "@atlaskit/primitives";
import Tooltip, { TooltipPrimitive } from "@atlaskit/tooltip";
import { WeightField } from "../../Components/GoalStructure/WeightField";
import { TotalPointsUI } from "../../Components/Estimation/TotalPointsUI";
import { Loading } from "../../Components/Common/Loading";

import QuestionCircleIcon from "@atlaskit/icon/glyph/question-circle";
import { Box } from "@atlaskit/primitives";

type SetValuesProps = {
  goal_tier_id: string;
  goals: Goal[];
  close: () => void;
  refresh: () => void;
};

const MAX_MONETARY_VALUE = 7; // Beholdes for WeightField prop, selv om den ikke brukes

export const SetValues = (props: SetValuesProps) => {
  const { goal_tier_id, goals, close, refresh } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [weights, setWeights] = useState<{ [goalId: string]: number }>({});

  const [scope] = useAppContext();
  const api = useAPI();

  // Hardkode Method til WEIGHT
  const method = `${balancedPointsEnum.WEIGHT}`;
  const postfix = "%"; // Hardkode Postfix

  const onClose = (shouldRefresh: boolean) => {
    if (shouldRefresh) props.refresh();
    close();
  };

  const updateValues = (
    value: number,
    _method: balancedPointsEnum, // 'method' ignoreres, da den alltid er WEIGHT
    goal: Goal
  ) => {
    setWeights((prevWeights) => ({
      ...prevWeights,
      [goal.id]: value,
    }));
  };

  useEffect(() => {
    if (goals.length > 0) {
      const initialWeights: { [goalId: string]: number } = {};

      goals.forEach((goal) => {
        const bp = goal.balancedPoints;

        // Håndterer kun eksisterende Balanced Points av typen WEIGHT, ellers 0
        if (bp && bp.type === balancedPointsEnum.WEIGHT) {
          initialWeights[goal.id] = bp.value || 0;
        } else {
          initialWeights[goal.id] = 0;
        }
      });

      setWeights(initialWeights);
    }
    setLoading(false);
  }, [goals]);

  const submit = async () => {
    setSubmitting(true);
    const updatedGoals = goals.map(
      (goal): Goal => ({
        ...goal,
        balancedPoints: {
          type: balancedPointsEnum.WEIGHT, // Hardkodet
          value: weights[goal.id] || 0, // Bruker kun weights
          postFix: "%", // Hardkodet
        } as balancedPoints,
      })
    );

    try {
      await api.goal.setAllBP(updatedGoals);
      setSubmitting(false);
      onClose(true);
    } catch (error) {
      console.error("Error setting goal points", error); // Oppdatert melding
      setSubmitting(false);
    }
  };

  const validate = (): boolean => {
    // Sjekker kun for total weight
    const totalValues = goals.reduce(
      (sum, goal) => sum + (weights[goal.id] || 0),
      0
    );
    return totalValues === 100;
  };

  const getTotal = useMemo((): number => {
    if (isLoading) return 0;
    let total = 0;
    goals.forEach((goal) => {
      total += weights?.[goal.id] || 0;
    });
    return total;
  }, [weights]);

  return (
    <ModalTransition>
      <Modal onClose={() => onClose(false)}>
        <ModalHeader>
          <ModalTitle>Set poeng for formål (strukturerte mål)</ModalTitle>
          <Tooltip content="Du kan angi verdiberegninger for formål ved å gi dem relative vekter («målpoeng»).">
            <Box
              style={{
                cursor: "pointer",
                position: "absolute",
                top: "1rem",
                right: "1rem",
              }}
            >
              <QuestionCircleIcon label="" />
            </Box>
          </Tooltip>
        </ModalHeader>
        <ModalBody>
          <Stack space="space.100">
            {/* Fjernet: Inline med Method RadioGroup og Postfix TextField */}

            {!isLoading ? (
              <>
                <Inline space="space.050">
                  {`Total vekt:`}
                  <Tooltip content={"Total weight"}>
                    <TotalPointsUI
                      totalPoints={getTotal}
                      pointsToDistribute={100}
                    />
                  </Tooltip>
                </Inline>
                <div>
                  <Flex
                    direction="row"
                    xcss={xcss({
                      width: "max-content",
                      maxWidth: "100%",
                      borderLeft: "1px solid",
                      borderBottom: "1px solid",
                      borderTop: "1px solid",
                      borderColor: "color.border",
                      borderRadius: "border.radius.100",
                      overflow: "hidden",
                      overflowX: "scroll",
                    })}
                  >
                    {goals.map((goal) => (
                      <WeightField
                        key={goal.id + "weightField"}
                        goal={goal}
                        submitting={submitting}
                        onChange={(points, method) =>
                          updateValues(points, method, goal)
                        }
                        maxMonetaryValue={MAX_MONETARY_VALUE}
                      />
                    ))}
                  </Flex>
                  <HelperMessage>Total vekt må være 100 %</HelperMessage>
                  <HelperMessage>Alle felt må fylles ut</HelperMessage>
                </div>
              </>
            ) : (
              <Loading />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={() => onClose(false)}>
            Avbryt
          </Button>
          <LoadingButton
            appearance="primary"
            isLoading={submitting}
            isDisabled={!validate()}
            onClick={() => submit()}
          >
            Lagre
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
