import React, { useEffect, useMemo } from "react";
import { Grid, Box, Inline, xcss } from "@atlaskit/primitives";
import Tooltip from "@atlaskit/tooltip";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import { useEstimation } from "../../../Pages/Estimation/EstimationContext";
import Button from "@atlaskit/button";
import { HideScrollBar } from "../../../Functions/EstimationHelper";
import { UpperTargetLabel } from "../UpperTargetLabel";
import { useScroll } from "../ScrollContext";
import RefreshIcon from "@atlaskit/icon/glyph/refresh";
import HipchatChevronUpIcon from "@atlaskit/icon/glyph/hipchat/chevron-up";
import HipchatChevronDownIcon from "@atlaskit/icon/glyph/hipchat/chevron-down";
import { CGCLabelContainer } from "./CGCLabelContainer";
import { useEstimationTarget } from "../../../Pages/Estimation/EstimationTargetContext";
import { token } from "@atlaskit/tokens";
import { PortfolioItemGoal } from "../../../Models/EstimationModel";
import { useTranslation } from "@forge/react";

export const TargetLabelContainer = () => {
  const { t } = useTranslation();
  const {
    mode,
    estimationTargets,
    upperGoals,
    pointsToDistribute,
    readyToSubmit,
  } = useEstimation();

  const {
    scope,
    goalTier,
    isCollapsed,
    toogleCollapse,
    getTotalDPPoints,
    clearGoals,
  } = useEstimationTarget();

  const goals = useEstimationTarget().goals as PortfolioItemGoal[];

  const [portfolioItemPoints, setPortfolioItemPoints] =
    React.useState<number>(0);
  const [distributedPoints, setDistributedPoints] = React.useState<number>(0);

  const { TargetRefs, onScroll } = useScroll();

  const totalDP = pointsToDistribute * upperGoals.length;

  const totalPoints = useMemo(() => {
    let points = 0;
    for (const upperGoal of upperGoals) {
      points += getTotalDPPoints(upperGoal.id);
    }
    return points;
  }, [getTotalDPPoints, upperGoals]);

  // Dynamisk tooltip og utseende basert på status
  const getDPStatus = () => {
    if (distributedPoints === upperGoals.length) {
      return {
        appearance: "success" as ThemeAppearance,
        tooltip: t("estimation_labels.distributed_all"),
      };
    }
    if (distributedPoints === 0) {
      return {
        appearance: "moved" as ThemeAppearance,
        tooltip: t("estimation_labels.not_submitted"),
      };
    }
    return {
      appearance: "removed" as ThemeAppearance,
      tooltip: t("estimation_labels.clear_or_distribute"),
    };
  };

  const status = getDPStatus();

  useEffect(() => {
    if (goals) {
      let count = 0;
      upperGoals.forEach((upperGoal) => {
        if (getTotalDPPoints(upperGoal.id) > 0) {
          count += 1;
        }
      });
      setDistributedPoints(count);
    }
  }, [getTotalDPPoints, upperGoals, goals]); // Fikset dependency array

  useEffect(() => {
    let total = 0;
    goals.forEach((goal) => {
      total += +goal.portfolioItemPoints.toFixed(2);
    });
    setPortfolioItemPoints(total);
  }, [goals]);

  return (
    <CGCLabelContainer mode={mode}>
      <Grid
        xcss={xcss({
          backgroundColor: "elevation.surface.sunken",
          position: "relative",
          gridTemplateRows: "52px 20px",
          borderRight: "1px solid",
          borderColor: "color.border",
          padding: "space.050",
          paddingLeft: "space.200",
          paddingRight: "space.200",
          overflow: "hidden",
          alignItems: "center",
          alignContent: "space-between",
        })}
      >
        <Grid templateRows="32px 20px">
          <Grid
            templateColumns="69px 24px 24px"
            xcss={xcss({ width: "100%", alignItems: "center" })}
          >
            <Tooltip content={scope.name}>
              <Box
                xcss={xcss({
                  fontWeight: "bold",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: "100%",
                })}
              >
                {scope.name.toUpperCase()}
              </Box>
            </Tooltip>
            <Tooltip content={t("estimation_labels.clear_points")}>
              <Button
                appearance="subtle"
                iconBefore={<RefreshIcon size="small" label="refresh" />}
                onClick={() => clearGoals()}
              />
            </Tooltip>
            <Tooltip content={t("estimation_labels.toggle_collection")}>
              <Button
                appearance="subtle"
                iconBefore={
                  isCollapsed ? (
                    <HipchatChevronUpIcon size="small" label="closed" />
                  ) : (
                    <HipchatChevronDownIcon size="small" label="opened" />
                  )
                }
                onClick={() => toogleCollapse()}
              />
            </Tooltip>
          </Grid>
          <Box xcss={xcss({ overflow: "hidden" })}>
            <Tooltip content={goalTier.name}>
              <Box
                xcss={xcss({
                  marginTop: "none",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                })}
              >
                {goalTier.name}
              </Box>
            </Tooltip>
          </Box>
        </Grid>
        <Inline alignBlock="center" alignInline="end" space="space.100">
          <Box xcss={xcss({ justifySelf: "end" })}>
            <Tooltip
              content={
                totalPoints === 0
                  ? t("estimation_labels.not_submitted")
                  : t("estimation_labels.total_points_distributed")
              }
            >
              <Lozenge
                appearance={
                  totalPoints === 0
                    ? "moved"
                    : totalPoints > totalDP
                    ? "removed"
                    : readyToSubmit
                    ? "success"
                    : "inprogress"
                }
                isBold
              >
                {totalPoints.toLocaleString()}
              </Lozenge>
            </Tooltip>
          </Box>
          <Box xcss={xcss({ justifySelf: "end" })}>
            <Tooltip content={t("estimation_labels.portfolio_item_weight")}>
              <Lozenge appearance="new" isBold>
                {portfolioItemPoints.toFixed(0)}
              </Lozenge>
            </Tooltip>
          </Box>
        </Inline>
      </Grid>
      <HideScrollBar
        scrollRef={
          TargetRefs[
            estimationTargets!.findIndex((c) => c.scope.id === scope.id)
          ]
        }
        style={{
          backgroundColor: token("elevation.surface.sunken"),
          display: "grid",
          gridTemplateRows: "28px",
          gridAutoFlow: "column",
          gridAutoColumns: "150px",
          alignContent: "end",
          overflowX: "scroll",
          justifyItems: "center",
        }}
        onScroll={onScroll}
      >
        {upperGoals.map((upperGoal) => (
          <UpperTargetLabel
            key={`${upperGoal.id}-connection-label`}
            upperGoal={upperGoal}
          />
        ))}
      </HideScrollBar>
    </CGCLabelContainer>
  );
};
