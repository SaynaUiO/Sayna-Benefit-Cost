import Button, { LoadingButton } from "@atlaskit/button";
import { HelperMessage, Label } from "@atlaskit/form";
import Modal, {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@atlaskit/modal-dialog";
import { RadioGroup } from "@atlaskit/radio";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Goal, balancedPoints, balancedPointsEnum } from "../../Models";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import TextField from "@atlaskit/textfield";
import { Inline } from "@atlaskit/primitives";
import { Flex, Stack, xcss } from "@atlaskit/primitives";
import Tooltip, { TooltipPrimitive } from "@atlaskit/tooltip";
import Lozenge from "@atlaskit/lozenge";
import { WeightField } from "../../Components/GoalStructure/WeightField";
import { TotalPointsUI } from "../../Components/Estimation/TotalPointsUI";
import { Loading } from "../../Components/Common/Loading";

import { token } from "@atlaskit/tokens";
import styled from "@emotion/styled";
import QuestionCircleIcon from "@atlaskit/icon/glyph/question-circle";
import { Box } from "@atlaskit/primitives";

const InlineDialog = styled(TooltipPrimitive)`
  background: white;
  border-radius: ${token("border.radius", "4px")};
  box-shadow: ${token("elevation.shadow.overlay")};
  box-sizing: content-box;
  color: black;
  max-height: 300px;
  max-width: 300px;
  padding: ${token("space.100", "8px")} ${token("space.150", "12px")};
`;

type SetValuesProps = {
  goal_tier_id: string;
  goals: Goal[];
  close: () => void;
  refresh: () => void;
};

const MAX_POSTFIX_LENGTH = 4;
const MAX_MONETARY_VALUE = 7;

export const SetValues = (props: SetValuesProps) => {
  const { goal_tier_id, goals, close, refresh } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [weights, setWeights] = useState<{ [goalId: string]: number }>({});
  const [monetaryValues, setMonetaryValues] = useState<{
    [goalId: string]: number;
  }>({});
  const [method, setMethod] = useState<string>(`${balancedPointsEnum.WEIGHT}`);
  const [postfix, setPostfix] = useState<string>("");

  const [scope] = useAppContext();
  const api = useAPI();

  const onClose = (refresh: boolean) => {
    if (refresh) props.refresh();
    close();
  };

  const updateValues = (
    value: number,
    method: balancedPointsEnum,
    goal: Goal
  ) => {
    if (method === balancedPointsEnum.WEIGHT) {
      setWeights((prevWeights) => ({
        ...prevWeights,
        [goal.id]: value,
      }));
    } else {
      setMonetaryValues((prevMonetaryValues) => ({
        ...prevMonetaryValues,
        [goal.id]: value,
      }));
    }
  };

  const fetch = async (goalCollectionId: string): Promise<Goal[]> => {
    return api.goal
      .getAll(scope.id, goalCollectionId)
      .then((goals) => {
        return goals;
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  const onChangeMethod = useCallback(
    (event: SyntheticEvent<HTMLInputElement>) => {
      setMethod(event.currentTarget.value);
    },
    []
  );

  useEffect(() => {
    if (goal_tier_id) {
      const goalCollectionId = goal_tier_id;
      setLoading(true);
      if (goals.length > 0) {
        if (
          goals[0].balancedPoints &&
          goals[0].balancedPoints!!.type === balancedPointsEnum.MONETARY
        ) {
          setPostfix(goals[0].balancedPoints!!.postFix);
          setMethod(`${balancedPointsEnum.MONETARY}`);
        }
      }
      setLoading(false);
    }
  }, [goals]);

  const postfixRef = useRef<HTMLInputElement | null>(null);

  const handleType = () => {
    if (postfixRef.current) {
      let value = postfixRef.current.value;
      if (value.length > MAX_POSTFIX_LENGTH) {
        postfixRef.current.value = value.slice(0, MAX_POSTFIX_LENGTH);
      }
      setPostfix(postfixRef.current.value);
    }
  };

  const handleSelect = (event: React.MouseEvent<HTMLInputElement>) => {
    if (postfixRef.current) postfixRef.current.select();
  };

  const submit = async () => {
    setSubmitting(true);
    const updatedGoals = goals.map(
      (goal): Goal => ({
        ...goal,
        balancedPoints: {
          type:
            method === `${balancedPointsEnum.WEIGHT}`
              ? balancedPointsEnum.WEIGHT
              : balancedPointsEnum.MONETARY,
          value:
            method === `${balancedPointsEnum.WEIGHT}`
              ? weights[goal.id]
              : monetaryValues[goal.id],
          postFix: method === `${balancedPointsEnum.WEIGHT}` ? "%" : postfix,
        } as balancedPoints,
      })
    );
    await api.goal
      .setAllBP(updatedGoals)
      .then(() => {
        setSubmitting(false);
        onClose(true);
      })
      .catch(() => {
        console.log("Error setting monetary values");
        setSubmitting(false);
      });
  };

  const validate = (): boolean => {
    if (method === `${balancedPointsEnum.WEIGHT}`) {
      const totalValues = goals.reduce(
        (sum, goal) => sum + (weights[goal.id] || 0),
        0
      );
      return totalValues === 100;
    }
    return (
      !!(monetaryValues && postfix.length <= MAX_POSTFIX_LENGTH) &&
      goals.every((goal) => !!monetaryValues[goal.id])
    );
  };

  const getTotal = useMemo((): number => {
    if (isLoading) return 0;
    let total = 0;
    goals.forEach((goal) => {
      if (method === `${balancedPointsEnum.WEIGHT}`) {
        total += weights?.[goal.id] || 0;
      } else {
        total += monetaryValues?.[goal.id] || 0;
      }
    });
    return total;
  }, [weights, monetaryValues, method]);

  return (
    <ModalTransition>
      <Modal onClose={() => onClose(false)}>
        <ModalHeader>
          <ModalTitle>Set Goal Points</ModalTitle>
          <Tooltip content='You can set value estimates of goals by either giving relative weights ("goal points") or monetary values.'>
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
            <Inline alignBlock="start" space="space.400">
              <div>
                <Label htmlFor="basic-textfield">Method</Label>
                <RadioGroup
                  onChange={onChangeMethod}
                  value={method}
                  isRequired={true}
                  options={[
                    {
                      name: "weight",
                      value: `${balancedPointsEnum.WEIGHT}`,
                      label: "Weight",
                    },
                    {
                      name: "monetary",
                      value: `${balancedPointsEnum.MONETARY}`,
                      label: "Monetary Value",
                    },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="basic-textfield">Postfix</Label>
                <TextField
                  name={`postfix`}
                  onClick={handleSelect}
                  appearance="standard"
                  isRequired={true}
                  width={65}
                  autoComplete="off"
                  isDisabled={
                    submitting || method === `${balancedPointsEnum.WEIGHT}`
                  }
                  ref={postfixRef}
                  value={
                    method === `${balancedPointsEnum.WEIGHT}` ? "%" : postfix
                  }
                  style={{
                    textAlign: "center",
                  }}
                  onChange={handleType}
                />
                {method === `${balancedPointsEnum.MONETARY}` ? (
                  <HelperMessage>
                    {`Maximum ${MAX_POSTFIX_LENGTH} characters`}
                  </HelperMessage>
                ) : (
                  <HelperMessage>
                    Only available for monetary value
                  </HelperMessage>
                )}
              </div>
            </Inline>
            {!isLoading ? (
              <>
                <Inline space="space.050">
                  {method === `${balancedPointsEnum.WEIGHT}`
                    ? `Total weight:`
                    : `Total value:`}
                  <Tooltip content={"Total value"}>
                    {method === `${balancedPointsEnum.WEIGHT}` ? (
                      <TotalPointsUI
                        totalPoints={getTotal}
                        pointsToDistribute={100}
                      />
                    ) : (
                      <Lozenge
                        appearance="new"
                        isBold
                      >{`${getTotal.toLocaleString(
                        "en-US"
                      )} ${postfix}`}</Lozenge>
                    )}
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
                        method={parseInt(method)}
                        postfix={postfix}
                        submitting={submitting}
                        onChange={(points, method) =>
                          updateValues(points, method, goal)
                        }
                        maxMonetaryValue={MAX_MONETARY_VALUE}
                      />
                    ))}
                  </Flex>
                  <HelperMessage>
                    {method === `${balancedPointsEnum.WEIGHT}`
                      ? "Total weight must be 100 %"
                      : "Monetary value cannot exceed " +
                        (Math.pow(10, MAX_MONETARY_VALUE) - 1).toLocaleString(
                          "en-US"
                        )}
                  </HelperMessage>
                  <HelperMessage>All fields need to be filled</HelperMessage>
                </div>
              </>
            ) : (
              <Loading />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <LoadingButton
            appearance="primary"
            isLoading={submitting}
            isDisabled={!validate()}
            onClick={() => submit()}
          >
            Set values
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
