import { Inline } from "@atlaskit/primitives";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { xcss } from "@atlaskit/primitives";
import { useEstimation } from "../../Pages/Estimation/EstimationContext";
import { Goal } from "../../Models/GoalModel";
import { useEstimationTarget } from "../../Pages/Estimation/EstimationTargetContext";

type UpperTargetLabelProps = {
  upperGoal: Goal;
};

export const UpperTargetLabel = ({ upperGoal }: UpperTargetLabelProps) => {
  const { pointsToDistribute } = useEstimation();
  const { getTotalDPPoints } = useEstimationTarget();

  let appearance: ThemeAppearance = "success";
  switch (true) {
    case getTotalDPPoints(upperGoal.id) > pointsToDistribute:
      appearance = "removed";
      break;
    case getTotalDPPoints(upperGoal.id) > 1:
      appearance = "success";
      break;
    case getTotalDPPoints(upperGoal.id) === 0:
      appearance = "inprogress";
      break;
  }

  return (
    <Inline
      alignInline="end"
      alignBlock="center"
      space="space.100"
      xcss={xcss({ overflow: "hidden" })}
    >
      <Tooltip content="Poeng fordelt">
        <Lozenge appearance={appearance} isBold>
          {getTotalDPPoints(upperGoal.id)}
        </Lozenge>
      </Tooltip>
    </Inline>
  );
};
