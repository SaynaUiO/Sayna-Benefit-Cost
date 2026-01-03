import Button, { LoadingButton } from "@atlaskit/button";
import { HelperMessage } from "@atlaskit/form";
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
import Tooltip from "@atlaskit/tooltip";
import { WeightField } from "../../Components/GoalStructure/WeightField";
import { TotalPointsUI } from "../../Components/Estimation/TotalPointsUI";
import { Loading } from "../../Components/Common/Loading";

import QuestionCircleIcon from "@atlaskit/icon/glyph/question-circle";
import { Box } from "@atlaskit/primitives";

// Import the translation hook
import { useTranslation } from "@forge/react";

type SetValuesProps = {
  goal_tier_id: string;
  goals: Goal[];
  close: () => void;
  refresh: () => void;
};

const MAX_MONETARY_VALUE = 7;

export const SetValues = (props: SetValuesProps) => {
  const { goals, close } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [weights, setWeights] = useState<{ [goalId: string]: number }>({});

  const { t } = useTranslation();
  const api = useAPI();

  const onClose = (shouldRefresh: boolean) => {
    if (shouldRefresh) props.refresh();
    close();
  };

  const updateValues = (
    value: number,
    _method: balancedPointsEnum,
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
          type: balancedPointsEnum.WEIGHT,
          value: weights[goal.id] || 0,
          postFix: "%",
        } as balancedPoints,
      })
    );

    try {
      await api.goal.setAllBP(updatedGoals);
      setSubmitting(false);
      onClose(true);
    } catch (error) {
      console.error(t("set_values.error_submit"), error);
      setSubmitting(false);
    }
  };

  const validate = (): boolean => {
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
  }, [weights, isLoading, goals]);

  return (
    <ModalTransition>
      <Modal onClose={() => onClose(false)}>
        <ModalHeader>
          <ModalTitle>{t("set_values.title")}</ModalTitle>
          <Tooltip content={t("set_values.help_tooltip")}>
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
            {!isLoading ? (
              <>
                <Inline space="space.050">
                  {t("set_values.total_weight_label")}
                  <Tooltip content={t("set_values.total_weight_tooltip")}>
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
                  <HelperMessage>{t("set_values.helper_total")}</HelperMessage>
                  <HelperMessage>
                    {t("set_values.helper_required")}
                  </HelperMessage>
                </div>
              </>
            ) : (
              <Loading />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={() => onClose(false)}>
            {t("set_values.cancel")}
          </Button>
          <LoadingButton
            appearance="primary"
            isLoading={submitting}
            isDisabled={!validate()}
            onClick={() => submit()}
          >
            {t("set_values.save")}
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
