import React, { useMemo, useState } from "react";
import { Grid, Box, Inline, xcss } from "@atlaskit/primitives";
import Tooltip from "@atlaskit/tooltip";
import { CGCLabelContainer } from "./CGCLabelContainer";
import { useEstimationTarget } from "../../../Pages/Estimation/EstimationTargetContext";
import { useEstimation } from "../../../Pages/Estimation/EstimationContext";
import Button from "@atlaskit/button";
import RefreshIcon from "@atlaskit/icon/glyph/refresh";
import Lozenge from "@atlaskit/lozenge";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import { useTranslation } from "@forge/react";

export const GoalCollectionLabelContainer = () => {
  const { t } = useTranslation();
  const { mode, upperGoals, pointsToDistribute } = useEstimation();
  const { goalTier, clearGoals, getTotalDPPoints } = useEstimationTarget();
  const [
    isClearDistributedPointsModalOpen,
    setIsClearDistributedPointsModalOpen,
  ] = useState<boolean>(false);

  const totalDP = pointsToDistribute * upperGoals.length;

  const totalPoints = useMemo(() => {
    let points = 0;
    for (const upperGoal of upperGoals) {
      points += getTotalDPPoints(upperGoal.id);
    }
    return points;
  }, [getTotalDPPoints, upperGoals]);

  return (
    <CGCLabelContainer mode={mode}>
      <Grid
        xcss={xcss({
          backgroundColor: "elevation.surface.sunken",
          position: "relative",
          gridTemplateRows: "32px 20px",
          borderRight: "1px solid",
          borderColor: "color.border",
          paddingBottom: "space.050",
          paddingLeft: "space.200",
          paddingRight: "space.200",
          overflow: "hidden",
          alignItems: "center",
          alignContent: "space-between",
        })}
      >
        <Grid
          templateColumns="93px 24px"
          xcss={xcss({ width: "100%", alignItems: "center" })}
        >
          <Tooltip content={goalTier.name}>
            <Box
              xcss={xcss({
                fontWeight: "bold",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
                maxWidth: "100%",
              })}
            >
              {goalTier.name.toUpperCase()}
            </Box>
          </Tooltip>
          <Tooltip content={t("estimation_labels.clear_points")}>
            <Button
              appearance="subtle"
              iconBefore={<RefreshIcon size="small" label="refresh" />}
              onClick={() => setIsClearDistributedPointsModalOpen(true)}
            />
          </Tooltip>
        </Grid>
        <Inline alignBlock="center" alignInline="end" space="space.100">
          <Box xcss={xcss({ justifySelf: "end" })}>
            <Tooltip content={t("estimation_labels.total_points_distributed")}>
              <Lozenge
                appearance={
                  totalPoints < totalDP
                    ? "inprogress"
                    : totalPoints > totalDP
                    ? "removed"
                    : "success"
                }
                isBold
              >
                {totalPoints.toLocaleString()}
              </Lozenge>
            </Tooltip>
          </Box>
        </Inline>
      </Grid>
      <ModalTransition>
        {isClearDistributedPointsModalOpen && (
          <Modal onClose={() => setIsClearDistributedPointsModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>{t("clear_points_modal.title")}</ModalTitle>
            </ModalHeader>
            <ModalBody>{t("clear_points_modal.body")}</ModalBody>
            <ModalFooter>
              <Button
                appearance="subtle"
                onClick={() => setIsClearDistributedPointsModalOpen(false)}
              >
                {t("clear_points_modal.cancel")}
              </Button>
              <Button
                appearance="danger"
                onClick={() => {
                  clearGoals();
                  setIsClearDistributedPointsModalOpen(false);
                }}
              >
                {t("clear_points_modal.confirm")}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </CGCLabelContainer>
  );
};
