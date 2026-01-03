import { Inline } from "@atlaskit/primitives";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { Grid, xcss } from "@atlaskit/primitives";
import { GoalPopup } from "./GoalPopup";
import { useEstimation } from "../../Pages/Estimation/EstimationContext";
import { Goal, balancedPointsEnum } from "../../Models";
import { useTranslation } from "@forge/react";

type EstimationPopupProps = {
  upperGoal: Goal;
};

export const EstimationUpperGoalLabel = ({
  upperGoal,
}: EstimationPopupProps) => {
  const { t } = useTranslation();
  const { relation, pointsToDistribute, getUpperGoalDP } = useEstimation();

  let appearance: ThemeAppearance = "success";
  const distributedPoints = getUpperGoalDP(upperGoal.id);

  switch (true) {
    case distributedPoints === pointsToDistribute:
      appearance = "success";
      break;
    case distributedPoints < pointsToDistribute:
      appearance = "inprogress";
      break;
    case distributedPoints > pointsToDistribute:
      appearance = "removed";
      break;
  }

  const calcTopCellStyle = xcss({
    gridTemplateRows: "32px 20px",
    backgroundColor: "elevation.surface.sunken",
    paddingBottom: "space.050",
    paddingLeft: "space.200",
    paddingRight: "space.200",
    borderBottom: "1px solid",
    borderColor: "color.border",
    alignContent: "space-between",
  });

  return (
    <Grid xcss={calcTopCellStyle}>
      <GoalPopup goal={upperGoal} isUpperGoal />
      <Inline alignInline="center" alignBlock="center" space="space.100">
        {relation.balance && (
          <Tooltip
            content={
              relation.method === balancedPointsEnum.WEIGHT
                ? t("estimation_labels.weight_tooltip")
                : t("estimation_labels.monetary_tooltip")
            }
          >
            <Lozenge appearance="new" isBold>{`${Number(
              upperGoal.balancedPoints!.value
            ).toLocaleString()} ${upperGoal.balancedPoints!.postFix}`}</Lozenge>
          </Tooltip>
        )}
        <Tooltip content={t("estimation_labels.distributed_points_tooltip")}>
          <Lozenge appearance={appearance} isBold>
            {distributedPoints} / {pointsToDistribute}
          </Lozenge>
        </Tooltip>
      </Inline>
    </Grid>
  );
};
