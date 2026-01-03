import React, { useMemo } from "react";
import { Inline, Flex, xcss } from "@atlaskit/primitives";
import Lozenge from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { GoalPopup } from "./GoalPopup";
import { useEstimation } from "../../Pages/Estimation/EstimationContext";
import { PortfolioItemGoal, Goal, GoalTypeEnum } from "../../Models";
import { useEstimationTarget } from "../../Pages/Estimation/EstimationTargetContext";
import { useTranslation } from "@forge/react";

type EstimationPopupProps = {
  goal: Goal | PortfolioItemGoal;
  simplified?: boolean;
};

export const GoalLabel = ({ goal, simplified }: EstimationPopupProps) => {
  const { t } = useTranslation();
  const { upperGoals } = useEstimation();
  const { goals } = useEstimationTarget();

  const totalPoints = useMemo(() => {
    let sum = 0;
    for (const upperGoal of upperGoals) {
      sum += goal.distributedPoints?.[upperGoal.id] || 0;
    }
    return sum;
  }, [upperGoals, goal.distributedPoints]); // Justert dependencies for bedre ytelse

  const calcTopCellStyle = xcss({
    height: simplified ? "94px" : "57px",
    paddingBottom: "space.075",
    paddingLeft: "space.200",
    paddingRight: "space.200",
    borderBottom: "1px solid",
    borderColor: "color.border",
    ":last-child": {
      borderBottom: "none",
    },
  });

  return (
    <Flex direction="column" xcss={calcTopCellStyle}>
      {!simplified ? (
        <GoalPopup goal={goal} />
      ) : (
        <p
          style={{
            marginTop: "0.25rem",
            marginBottom: "0.25rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 4,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
          }}
          title={goal.description}
        >
          {goal.description}
        </p>
      )}
      {!simplified && (
        <Inline
          alignInline="end"
          alignBlock="center"
          space="space.050"
          xcss={xcss({ overflow: "hidden" })}
        >
          {"portfolioItemPoints" in goal && (
            <Tooltip content={t("estimation_labels.portfolio_contribution")}>
              <Lozenge isBold>{goal.portfolioItemPoints}</Lozenge>
            </Tooltip>
          )}

          <Tooltip
            content={
              goal.type === GoalTypeEnum.GOAL
                ? t("estimation_labels.even_benefit_points")
                : t("estimation_labels.benefit_points")
            }
          >
            <Lozenge appearance="new" isBold>
              {goal.balancedPoints!.value.toLocaleString()}
            </Lozenge>
          </Tooltip>

          {goal.issueCost && (
            <Tooltip content={t("estimation_labels.benefit_cost_ratio")}>
              <Lozenge appearance="inprogress" isBold>
                {(
                  Math.round(
                    (goal.balancedPoints!.value /
                      Math.max(
                        (goal.issueCost!.balanced_points || 0) * 100,
                        1
                      )) *
                      100
                  ) / 100
                ).toLocaleString()}
              </Lozenge>
            </Tooltip>
          )}

          <Tooltip content={t("estimation_labels.points_distributed")}>
            <Lozenge appearance="success" isBold>
              {totalPoints.toLocaleString()}
            </Lozenge>
          </Tooltip>
        </Inline>
      )}
    </Flex>
  );
};
