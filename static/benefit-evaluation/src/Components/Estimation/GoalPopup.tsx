import { token } from "@atlaskit/tokens";
import { ReactNode, useMemo, useState } from "react";
import Button from "@atlaskit/button";
import EditorPanelIcon from "@atlaskit/icon/glyph/editor/panel";
import Popup from "@atlaskit/popup";
import React from "react";
import { Inline, Stack, xcss } from "@atlaskit/primitives";
import Heading from "@atlaskit/heading";
import {
  Goal,
  GoalTypeEnum,
  PortfolioItemGoal,
  balancedPointsEnum,
} from "../../Models";
import Lozenge from "@atlaskit/lozenge";
import { useEstimation } from "../../Pages/Estimation/EstimationContext";
import { useTranslation } from "@forge/react";

type GoalPopupProps = {
  goal: Goal | PortfolioItemGoal;
  isUpperGoal?: true;
};

export const GoalPopup = ({ goal, isUpperGoal }: GoalPopupProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { upperGoals, relation } = useEstimation();

  const totalPoints = useMemo(() => {
    let sum = 0;
    for (const upperGoal of upperGoals) {
      sum += goal.distributedPoints?.[upperGoal.id] || 0;
    }
    return sum;
  }, [goal.distributedPoints, upperGoals]);

  const contentStyles: React.CSSProperties = {
    padding: token("space.200", "16px"),
    maxWidth: "200px",
  };

  const PropertyStack = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <Stack space="space.050" alignInline="start">
      <h5>{title}</h5>
      {children}
    </Stack>
  );

  const properties = () => {
    const props = [];

    // Poeng fordelt
    if (!isUpperGoal) {
      props.push(
        <PropertyStack
          key="pd"
          title={t("estimation_labels.points_distributed")}
        >
          <Lozenge appearance="inprogress" isBold>
            {totalPoints.toLocaleString()}
          </Lozenge>
        </PropertyStack>
      );
    }

    // Portfolio Contribution
    if ("portfolioItemPoints" in goal) {
      props.push(
        <PropertyStack
          key="pip"
          title={t("estimation_labels.portfolio_contribution")}
        >
          <Lozenge isBold>{goal.portfolioItemPoints.toFixed(2)}%</Lozenge>
        </PropertyStack>
      );
    }

    // Balanced / Benefit Points / Weight
    if (
      goal.balancedPoints &&
      ((isUpperGoal && relation.balance) || !isUpperGoal)
    ) {
      const getTitle = () => {
        if (relation.balance && relation.method === balancedPointsEnum.WEIGHT) {
          return t("set_values.total_weight_tooltip"); // Reusing "Weight"
        }
        if (goal.type === GoalTypeEnum.ISSUE) {
          return t("estimation_labels.benefit_points");
        }
        return t("estimation_labels.balanced_points");
      };

      props.push(
        <PropertyStack key="bp" title={getTitle()}>
          <Lozenge appearance="new" isBold>
            {`${Number(goal.balancedPoints!.value).toLocaleString()} ${
              isUpperGoal ? goal.balancedPoints!.postFix : ""
            }`}
          </Lozenge>
        </PropertyStack>
      );
    }
    return props;
  };

  return (
    <Inline alignInline="center" alignBlock="center" spread="space-between">
      <Heading level="h400">{goal.key}</Heading>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        zIndex={9999}
        content={() => (
          <div style={contentStyles}>
            <Stack>
              <h4>{goal.key}</h4>
              <Stack
                xcss={xcss({ marginTop: "10px" })}
                alignInline="start"
                alignBlock="center"
                space="space.100"
              >
                {properties()}
              </Stack>
              <p>{goal.description}</p>
            </Stack>
          </div>
        )}
        trigger={(triggerProps) => (
          <Button
            {...triggerProps}
            iconBefore={<EditorPanelIcon label="Goal Info" />}
            appearance="subtle"
            isSelected={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
        )}
      />
    </Inline>
  );
};
