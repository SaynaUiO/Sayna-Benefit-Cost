import { Inline } from "@atlaskit/primitives";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { Grid, xcss } from "@atlaskit/primitives";
import { GoalPopup } from "./GoalPopup";
import { useEstimation } from "../../Pages/Estimation/EstimationContext";
import { Goal, balancedPointsEnum } from "../../Models";

type EstimationPopupProps = {
  upperGoal: Goal;
};

export const EstimationUpperGoalLabel = ({
  upperGoal,
}: EstimationPopupProps) => {
  const { relation, pointsToDistribute, getUpperGoalDP } = useEstimation();

  let appearance: ThemeAppearance = "success";
  switch (true) {
    case getUpperGoalDP(upperGoal.id) === pointsToDistribute:
      appearance = "success";
      break;
    case getUpperGoalDP(upperGoal.id) < pointsToDistribute:
      appearance = "inprogress";
      break;
    case getUpperGoalDP(upperGoal.id) > pointsToDistribute:
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
                ? "Weight Denne?"
                : "Monetary Value"
            }
          >
            <Lozenge appearance="new" isBold>{`${Number(
              upperGoal.balancedPoints!.value
            ).toLocaleString("en-US")} ${
              upperGoal.balancedPoints!.postFix
            }`}</Lozenge>
          </Tooltip>
        )}
        <Tooltip content="Poeng fordelt">
          <Lozenge appearance={appearance} isBold>
            {getUpperGoalDP(upperGoal.id)} / {pointsToDistribute}
          </Lozenge>
        </Tooltip>
      </Inline>
    </Grid>
  );
};
