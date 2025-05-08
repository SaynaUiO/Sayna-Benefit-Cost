import Lozenge from "@atlaskit/lozenge";
import { ThemeAppearance } from "@atlaskit/lozenge";

type TotalPointsUIProps = {
  totalPoints: number;
  pointsToDistribute: number;
}

export const TotalPointsUI = ({totalPoints, pointsToDistribute}: TotalPointsUIProps) => {
  let appearance: ThemeAppearance = "success";
  switch (true) {
    case totalPoints === pointsToDistribute:
      appearance = "success"
      break;
    case totalPoints < pointsToDistribute:
      appearance = "inprogress"
      break;
    case totalPoints > pointsToDistribute:
      appearance = "removed"
      break;
  }
  return (
    <Lozenge appearance={appearance} isBold>
      {totalPoints} / {pointsToDistribute}
    </Lozenge>
  )
}