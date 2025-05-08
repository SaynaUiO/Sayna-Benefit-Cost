import { useEffect, useState, useRef } from "react";
import PageHeader from "@atlaskit/page-header";
import { useLocation } from "react-router-dom";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import {
  GoalTier,
  GoalTierTypeEnum,
  GoalTableItem,
  GoalTableItemTypeEnum,
  Goal,
  balancedPointsEnum,
} from "../../Models";
import { EpicTable } from "../../Components/Analysis/Table/EpicTable";
import { Loading } from "../../Components/Common/Loading";
import Select, { OptionType, StylesConfig } from "@atlaskit/select";
import { Label } from "@atlaskit/form";
import Toggle from "@atlaskit/toggle";
import Textfield from "@atlaskit/textfield";
import { LoadingButton } from "@atlaskit/button";
import Timeline from "../../Components/Analysis/Charts/Timeline";
import { ScatterChart } from "../../Components/Analysis/Charts/ScatterChart";
import { PieChartBenefit } from "../../Components/Analysis/Charts/PieChartBenefit";
import RemainingBenefit from "../../Components/Analysis/Charts/RemainingBenefit";
import RealizedBenefit from "../../Components/Analysis/Charts/RealizedBenefit";
import CumulativePoints from "../../Components/Analysis/Charts/CumulativePoints";
import { BudgetDetails } from "../../Models/BudgetModel";
import Tooltip, { TooltipPrimitive } from "@atlaskit/tooltip";
import QuestionCircleIcon from "@atlaskit/icon/glyph/question-circle";
import { Box } from "@atlaskit/primitives";
import { token } from "@atlaskit/tokens";
import styled from "@emotion/styled";

type option = {
  label: string;
  value: GoalTier;
};

const customSelectStyle: StylesConfig = {
  container: (styles: any) => ({ ...styles, width: "16rem" }),
};

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

export const Analysis = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [goalCollection, setSelectedOption] = useState<option | undefined>();
  const [items, setItems] = useState<GoalTableItem[]>([]);
  const [sortBy, setSortBy] = useState<{ label: string; value: string }>({
    label: "Benefit/Cost",
    value: "benefitcost",
  });
  const [sortedItems, setSortedItems] = useState<GoalTableItem[]>([]);

  const [upperGoals, setUpperGoals] = useState<Goal[]>([]);
  const [upperIsMonetary, setUpperIsMonetary] = useState<boolean>(false);
  const [isMonetary, setIsMonetary] = useState<boolean>(false);
  const [postfix, setPostfix] = useState<string>("$");
  const [expectedBenefit, setExpectedBenefit] = useState<number>(0);
  const [expectedCosts, setExpectedCosts] = useState<number>(0);
  const [budgetSavingLoading, setBudgetSavingLoading] =
    useState<boolean>(false);

  const postfixRef = useRef<HTMLInputElement | null>(null);
  const expectedBenefitRef = useRef<HTMLInputElement | null>(null);
  const expectedCostRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const copy = [...items];

    let costValue = !upperIsMonetary ? expectedCosts / 100 : 0;
    let pointValue = upperIsMonetary
      ? upperGoals.reduce(
          (acc, curr) => acc + curr!!.balancedPoints!!.value,
          0
        ) / 100
      : expectedBenefit / 100;

    copy.sort((a, b) => {
      const aValue = isMonetary
        ? a.balancedPoints!!.value * pointValue
        : a.balancedPoints?.value!!;
      const bValue = isMonetary
        ? b.balancedPoints!!.value * pointValue
        : b.balancedPoints?.value!!;

      const aCost = isMonetary
        ? upperIsMonetary
          ? a.issueCost!!.cost
          : costValue * (a.issueCost!!.balanced_points || 0) * 100
        : (a.issueCost!!.balanced_points || 1 / items.length) * 100;
      const bCost = isMonetary
        ? upperIsMonetary
          ? b.issueCost!!.cost
          : costValue * (b.issueCost!!.balanced_points || 0) * 100
        : (b.issueCost!!.balanced_points || 1 / items.length) * 100;

      if (sortBy.value === "benefit") {
        const compare = bValue - aValue;

        if (compare === 0) return a.issueCost!!.time - b.issueCost!!.time;
        return compare;
      } else if (sortBy.value === "benefitcost") {
        const compare = bValue / bCost - aValue / aCost;

        if (compare === 0) return a.issueCost!!.time - b.issueCost!!.time;
        return compare;
      } else if (sortBy.value === "benefitcosttime") {
        const compare =
          bValue / bCost / b.issueCost!!.time -
          aValue / aCost / a.issueCost!!.time;
        return compare;
      } else {
        const sortedBalanceTime =
          bValue / (b.issueCost?.time || 1) - aValue / (a.issueCost?.time || 1);
        if (sortedBalanceTime === 0) return bValue / bCost - aValue / aCost;

        return sortedBalanceTime;
      }
    });
    setSortedItems(copy);
  }, [
    items,
    sortBy,
    upperIsMonetary,
    isMonetary,
    expectedBenefit,
    expectedCosts,
  ]);

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;

  const fetchGoalCollection = async () => {
    return api.goalTier
      .getAll(scope.id, scope.type)
      .then(async (goalTiers) => {
        const goalTiersMapped = goalTiers.map(
          (goalTier: GoalTier, index): option => {
            return {
              label: `Tier ${index + 1} – ${goalTier.name}`,
              value: goalTier,
            };
          }
        );

        if (goalTiersMapped.length >= 2) {
          const upGoals: Goal[] = await api.goal.getAll(
            goalTiersMapped[goalTiersMapped.length - 1].value.scopeId,
            goalTiersMapped[goalTiersMapped.length - 1].value.id
          );

          const upIsMonetary = upGoals.some(
            (goal) => goal.balancedPoints?.type === balancedPointsEnum.MONETARY
          );
          if (upIsMonetary)
            setPostfix(upGoals[0].balancedPoints?.postFix || "$");
          else getBudget();

          setUpperIsMonetary(upIsMonetary);
          setUpperGoals(upGoals);
        } else {
          getBudget();
        }

        return goalTiersMapped.filter(
          (option) => option.value.type === GoalTierTypeEnum.ISSUE_TYPE
        );
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  const fetchItems = async () => {
    return await api.issue
      .getAll()
      .then(async (issues) => {
        const mappedIssues = issues.map((issue) => {
          return {
            ...issue,
            type: GoalTableItemTypeEnum.ISSUE,
          } as GoalTableItem;
        });

        for (const i of mappedIssues)
          if (i.balancedPoints === undefined)
            i.balancedPoints = { postFix: "$", type: 1, value: 0 };

        return mappedIssues;
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchGoalCollection()
      .then((options) => {
        setLoading(false);
        if (options.length === 0) setError("No issue types found");
        setSelectedOption(options[0]);
        setError("");
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!goalCollection) return;

    let isMounted = true;
    setLoading(true);
    fetchItems().then((items) => {
      if (isMounted) {
        let totalCosts = 0;
        items.forEach((item) => {
          if (item.issueCost === undefined)
            item.issueCost = {
              cost: 1,
              time: 1,
              balanced_points: 0,
            };
          if (item.issueCost.cost === 0) item.issueCost.cost = 1;
          if (item.issueCost.time === 0) item.issueCost.time = 1;
          totalCosts += item.issueCost.cost;
        });
        // * Make sure the balanced_points for costs is fixed
        items.forEach((item) => {
          item.issueCost!!.balanced_points = item.issueCost!!.cost / totalCosts;
        });
        setItems(items);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [goalCollection, refresh]);

  if (isLoading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Loading />
      </div>
    );

  const handleExpectedBenefitValueChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    if (expectedBenefitRef.current) {
      let value = expectedBenefitRef.current.value;
      if (!value || value === "") {
        setExpectedBenefit(0);
      } else if (isNaN(+value)) {
      } else if (+value > 9999999) {
        setExpectedBenefit(9999999);
      } else {
        setExpectedBenefit(+value);
      }
    }
  };

  const handleExpectedCostValueChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    if (expectedCostRef.current) {
      let value = expectedCostRef.current.value;
      if (!value || value === "") {
        setExpectedCosts(0);
      } else if (isNaN(+value)) {
      } else if (+value > 9999999) {
        setExpectedCosts(999999);
      } else {
        setExpectedCosts(+value);
      }
    }
  };

  const handlePostfixChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (postfixRef.current) {
      let value = postfixRef.current.value;
      setPostfix(value);
    }
  };

  const saveBudget = () => {
    setBudgetSavingLoading(true);
    api.project
      .setBudgetDetails(expectedBenefit, expectedCosts, postfix)
      .then(() => {
        setBudgetSavingLoading(false);
      });
  };

  const getBudget = () => {
    if (!upperIsMonetary)
      api.project.getBudgetDetails().then((details: BudgetDetails) => {
        setExpectedBenefit(details.expectedBenefit);
        setPostfix(details.postfix);
        setExpectedCosts(details.expectedCosts);
      });
  };

  return (
    <>
      <PageHeader>Analysis</PageHeader>
      <p>
        Unless the monetary value is shown both the benefit and costs are
        normalized to a total of 100 points each.
      </p>
      {error !== "" || goalCollection?.value === undefined ? (
        <p>{error} ERROR</p>
      ) : (
        <>
          {
            <>
              <Label htmlFor="toggle-monetary">Show In Monetary Value</Label>
              <Toggle
                id="toggle-monetary"
                isChecked={isMonetary}
                onChange={() => setIsMonetary((prev: boolean) => !prev)}
              />
              <br />
              {!upperIsMonetary && isMonetary && (
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "10rem",
                      display: "inline-block",
                      marginRight: "0.5rem",
                    }}
                  >
                    <Label htmlFor="expected-project-benefit">
                      Expected Project Benefit
                    </Label>
                    <Textfield
                      id="expected-project-benefit"
                      placeholder="Expected Project Benefit"
                      onChange={handleExpectedBenefitValueChange}
                      value={expectedBenefit.toString()}
                      ref={expectedBenefitRef}
                      maxLength={7}
                    />
                  </div>
                  <div
                    style={{
                      width: "10rem",
                      display: "inline-block",
                      marginRight: "0.5rem",
                    }}
                  >
                    <Label htmlFor="expected-project-costs">
                      Expected Project Costs
                    </Label>
                    <Textfield
                      id="expected-project-costs"
                      placeholder="Expected Project Costs"
                      onChange={handleExpectedCostValueChange}
                      value={expectedCosts.toString()}
                      ref={expectedCostRef}
                      maxLength={7}
                    />
                  </div>
                  <div
                    style={{
                      width: "5rem",
                      display: "inline-block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Label htmlFor="postfix">Postfix</Label>
                    <Textfield
                      id="postfix"
                      placeholder="Postfix"
                      ref={postfixRef}
                      value={postfix}
                      maxLength={4}
                      onChange={handlePostfixChange}
                    />
                  </div>
                  <br />
                  <LoadingButton
                    appearance="primary"
                    onClick={saveBudget}
                    isLoading={budgetSavingLoading}
                  >
                    Save
                  </LoadingButton>
                </div>
              )}
            </>
          }

          <EpicTable
            goalTier={goalCollection?.value}
            items={items}
            loading={isLoading}
            showMonetary={isMonetary}
            pointValue={
              upperIsMonetary
                ? upperGoals.reduce(
                    (acc, curr) => acc + curr!!.balancedPoints!!.value,
                    0
                  ) / 100
                : expectedBenefit / 100
            }
            upperIsMonetary={upperIsMonetary}
            costValue={!upperIsMonetary ? expectedCosts / 100 : 0}
            postfix={postfix}
          />

          <div style={{ position: "relative", width: "20rem" }}>
            <Label htmlFor="select-sorting">Sort By</Label>
            <Select<OptionType>
              inputId="select-sorting"
              value={sortBy}
              options={[
                { label: "Benefit/Cost", value: "benefitcost" },
                { label: "Benefit", value: "benefit" },
                { label: "Benefit/Time", value: "benefittime" },
                {
                  label: "(Benefit/Cost)/Time",
                  value: "benefitcosttime",
                },
              ]}
              onChange={(e: any) => {
                setSortBy(e);
              }}
              placeholder="Sort by"
              styles={customSelectStyle}
            />
            <Tooltip content="View the graphs and timeline sorted based on the selected value.">
              <Box
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  top: "1.75rem",
                  right: "1rem",
                }}
              >
                <QuestionCircleIcon label="" />
              </Box>
            </Tooltip>
          </div>

          <div className="grid-container" style={{ marginTop: 20 }}>
            <div className="grid-item-full">
              <Timeline items={sortedItems} />
            </div>
            <div className="grid-item">
              <RemainingBenefit
                items={sortedItems}
                isMonetary={isMonetary}
                upperIsMonetary={upperIsMonetary}
                costValue={!upperIsMonetary ? expectedCosts / 100 : 0}
                pointValue={
                  upperIsMonetary
                    ? upperGoals.reduce(
                        (acc, curr) => acc + curr!!.balancedPoints!!.value,
                        0
                      ) / 100
                    : expectedBenefit / 100
                }
              />
            </div>
            <div className="grid-item">
              <RealizedBenefit
                items={sortedItems}
                isMonetary={isMonetary}
                upperIsMonetary={upperIsMonetary}
                costValue={!upperIsMonetary ? expectedCosts / 100 : 0}
                pointValue={
                  upperIsMonetary
                    ? upperGoals.reduce(
                        (acc, curr) => acc + curr!!.balancedPoints!!.value,
                        0
                      ) / 100
                    : expectedBenefit / 100
                }
              />
            </div>
            <div className="grid-item">
              <ScatterChart items={items} />
            </div>
            <div className="grid-item">
              <CumulativePoints items={sortedItems} />
            </div>
            <div className="grid-item">
              <PieChartBenefit items={sortedItems} benefit={true} />
            </div>
            <div className="grid-item">
              <PieChartBenefit items={sortedItems} benefit={false} />
            </div>
          </div>
        </>
      )}
    </>
  );
};
