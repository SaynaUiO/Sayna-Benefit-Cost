import Button, { LoadingButton } from "@atlaskit/button";
import { HelperMessage } from "@atlaskit/form";
import Modal, {
  ModalTransition,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@atlaskit/modal-dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Goal, CostTime, GoalTableItem } from "../../Models";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { Inline } from "@atlaskit/primitives";
import { Flex, Stack, xcss } from "@atlaskit/primitives";
import Tooltip from "@atlaskit/tooltip";
import Lozenge from "@atlaskit/lozenge";
import { Label } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";
import { Loading } from "../../Components/Common/Loading";
import { CostField } from "../../Components/GoalStructure/CostField";
import { CostTimeTableHeader } from "./CostTimeTableHeader";

type EpicCostTimeProps = {
  items: GoalTableItem[];
  scopeId: string;
  scopeType: number;
  upperIsMonetary: boolean;
  postfix: string;
  close: () => void;
  refresh: () => void;
};

export const SetEpicCostTime = (props: EpicCostTimeProps) => {
  const { items, scopeId, scopeType, close, refresh } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [values, setValues] = useState<{ [goalId: string]: CostTime }>({});
  const [balancedCosts, setBalancedCosts] = useState<{
    [id: string]: number;
  }>({});
  const [total, setTotal] = useState<number>(0);
  const [total_time, setTotalTime] = useState<number>(0);
  const [validate, setValidate] = useState<boolean>(false);

  const navigate = useNavigate();
  const [scope] = useAppContext();
  const api = useAPI();

  const onClose = (refresh: boolean) => {
    if (refresh) props.refresh();
    close();
  };

  const updateValues = (cost: number, time: number, goal: Goal) => {
    setValues((prevValues) => ({
      ...prevValues,
      [goal.id]: {
        cost: cost,
        time: time,
        balanced_points: cost,
      },
    }));
  };

  useEffect(() => {
    setLoading(true);
    setGoals(
      items
        .map(
          (item) =>
            ({
              ...item,
              scopeId: scopeId,
              type: scopeType,
            } as Goal)
        )
        .reverse()
    );
    const values: { [goalId: string]: CostTime } = {};
    items.forEach((item) => {
      values[item.id] = {
        cost: item.issueCost?.cost || 1,
        time: item.issueCost?.time || 0,
        balanced_points: item.issueCost?.balanced_points || 1,
      };
    });
    setValues(values);
    setLoading(false);
  }, [items]);

  useEffect(() => {
    if (isLoading) return;
    let totalCosts = 0;
    let totalTime = 0;
    Object.values(values).forEach((value) => {
      totalCosts += value.cost > 0 ? value.cost : 1;
      totalTime += value.time;
    });

    setValidate(
      Object.values(values)
        .map((item) => item.cost)
        .every((value: number) => {
          return value >= 1;
        })
    );

    const balanced_costs: { [id: string]: number } = {};
    Object.keys(values).forEach((goalId: string) => {
      balanced_costs[goalId] = values[goalId].cost / totalCosts;
    });

    // Update states
    setBalancedCosts(balanced_costs);
    setTotal(totalCosts);
    setTotalTime(totalTime);
  }, [values, items]);

  const submit = async () => {
    setSubmitting(true);
    const updatedValues = { ...values };
    Object.keys(updatedValues).forEach((goalId) => {
      updatedValues[goalId].balanced_points = balancedCosts[goalId];
    });

    const goalsToUpdate: Goal[] = goals.map((goal) => {
      // Henter de nye verdiene fra state
      const newCostTime = values[goal.id];

      // Oppdaterer issueCost på det originale Goal-objektet
      return {
        ...goal,
        issueCost: {
          cost: newCostTime.cost,
          time: newCostTime.time,
          // Serveren må kanskje beregne balanced_points, så vi setter den til 0
          balanced_points: 0,
        },
      };
    });

    await api.goal
      .setAllCosts(goalsToUpdate)
      .then(() => {
        setSubmitting(false);
        onClose(true);
      })
      .catch((error) => {
        console.error(error);
        setSubmitting(false);
      });
  };

  return (
    <ModalTransition>
      <Modal onClose={() => onClose(false)}>
        <ModalHeader>
          <ModalTitle>Angi Kostnader og Tid</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Stack space="space.100">
            {!isLoading ? (
              <>
                <Inline space="space.050">
                  {props.upperIsMonetary
                    ? "Kostnaden er de forventede livssykluskostnadene for hver epic."
                    : "Kostnaden er de forventede relative livssykluskost-poengene for hver epic."}{" "}
                  Og alle disse verdiene vil bli normalisert til totalt 100
                  kostnadspoeng.
                </Inline>
                <Inline space="space.050">
                  Tiden er den forventede relative tiden for å fullføre hver
                  epic. Dette er en relativ verdi, altså ikke i timer eller
                  dager.
                </Inline>
                <Inline space="space.050">
                  {"Total costs:"}
                  <Tooltip content={"Total costs"}>
                    <Lozenge appearance="new" isBold>
                      {total}
                    </Lozenge>
                  </Tooltip>
                </Inline>
                <Inline space="space.050">
                  {"Total time:"}
                  <Tooltip content={"Total time"}>
                    <Lozenge appearance="new" isBold>
                      {total_time}
                    </Lozenge>
                  </Tooltip>
                </Inline>

                {props.upperIsMonetary && (
                  <>
                    <Label htmlFor="postfix">
                      Postfix Monetary Measurement
                    </Label>
                    <div style={{ width: "5rem" }}>
                      <Textfield
                        id="postfix"
                        isDisabled={true}
                        isReadOnly={true}
                        placeholder="Postfix"
                        value={props.postfix || "$"}
                      />
                    </div>
                  </>
                )}
                <div>
                  <Flex
                    direction="column"
                    xcss={xcss({
                      width: "max-content",
                      borderLeft: "1px solid",
                      borderBottom: "1px solid",
                      borderTop: "1px solid",
                      borderColor: "color.border",
                      borderRadius: "border.radius.100",
                    })}
                  >
                    <CostTimeTableHeader />
                    {goals.map((goal) => (
                      <CostField
                        key={goal.id + "costField"}
                        task={goal}
                        submitting={submitting}
                        initialValue={values[goal.id]}
                        onChange={(cost, time, goal) =>
                          updateValues(cost, time, goal)
                        }
                      />
                    ))}
                  </Flex>
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
            isDisabled={!validate}
            onClick={() => submit()}
          >
            Set Time and Cost
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
