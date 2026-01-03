import React, { useMemo, useState } from "react";
import DynamicTable from "@atlaskit/dynamic-table";
import Lozenge from "@atlaskit/lozenge";
import Select from "@atlaskit/select";
import { Goal } from "../../Models";
// 1. Updated imports: Removed the static variables, only importing types
import {
  EpicProfileSelections,
  ProfileOption,
  ProfileOptionMap,
} from "./periodizationTypes";
import { SpotlightTarget } from "@atlaskit/onboarding";
import Button from "@atlaskit/button";
import CashIcon from "@atlaskit/icon/core/cash";
import { Box, xcss } from "@atlaskit/primitives";

import Modal, {
  ModalTransition,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog";
import { EconomicConfig } from "./EconomicConfig";
import { token } from "@atlaskit/tokens";
import Tooltip from "@atlaskit/tooltip";
import { useTranslation } from "@forge/react";

// 2. Updated Interface to include the new props
interface EpicSelectionTableProps {
  epicGoals: Goal[] | null;
  profileSelections: EpicProfileSelections;
  handleProfileChange: (
    epicId: string,
    type: "bp" | "sp",
    selectedOption: ProfileOption | null
  ) => void;
  bpNokFactor: number;
  spNokFactor: number;
  handleFactorChange: (factorType: "bp" | "sp", newValue: number) => void;

  // New props passed down from Analysis.tsx
  benefitProfiles: ProfileOption[];
  costProfiles: ProfileOption[];
  benefitProfileMap: ProfileOptionMap;
  costProfileMap: ProfileOptionMap;
}

export const EpicSelectionTable: React.FC<EpicSelectionTableProps> = ({
  epicGoals,
  profileSelections,
  handleProfileChange,
  bpNokFactor,
  spNokFactor,
  handleFactorChange,
  // 3. Destructure the new props here
  benefitProfiles,
  costProfiles,
  benefitProfileMap,
  costProfileMap,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 4. Localized Table Head definition
  const head = useMemo(
    () => ({
      cells: [
        { key: "epic", content: t("analysis.table.epic"), width: 10 },
        { key: "bp", content: t("analysis.table.bp"), width: 10 },
        { key: "bpNok", content: t("analysis.table.bp_nok"), width: 15 },
        { key: "sp", content: t("analysis.table.sp"), width: 10 },
        { key: "spNok", content: t("analysis.table.sp_nok"), width: 15 },
        { key: "bpProfile", content: t("analysis.table.select_bp"), width: 20 },
        { key: "spProfile", content: t("analysis.table.select_sp"), width: 20 },
      ],
    }),
    [t]
  );

  const formatNokValue = (value: number) => {
    if (isNaN(value) || value === 0) return "0.0";
    return value.toFixed(2).replace(".", ",");
  };

  const rows = useMemo(() => {
    return epicGoals?.map((epic) => {
      const epicId = epic.id;
      const rawBP = epic.balancedPoints?.value || 0;
      const rawSP = epic.issueCost?.cost || 0;

      const bpNokValue = rawBP * bpNokFactor;
      const spNokValue = rawSP * spNokFactor;

      // 5. Logic now uses props instead of imported variables
      const currentKeys = profileSelections[epicId] || {
        benefitProfileKey: benefitProfiles[0]?.value,
        costProfileKey: costProfiles[0]?.value,
      };

      const currentBP = benefitProfileMap[currentKeys.benefitProfileKey];
      const currentSP = costProfileMap[currentKeys.costProfileKey];

      return {
        key: epicId,
        cells: [
          { key: "epic", content: epic.key },
          {
            key: "bp",
            content: (
              <Lozenge appearance="new" isBold>
                {String(rawBP)}
              </Lozenge>
            ),
          },
          {
            key: "bpNok",
            content: (
              <Lozenge appearance="inprogress" isBold>
                {formatNokValue(bpNokValue)}
              </Lozenge>
            ),
          },
          {
            key: "sp",
            content: (
              <Lozenge appearance="success" isBold>
                {String(rawSP)}
              </Lozenge>
            ),
          },
          {
            key: "spNok",
            content: (
              <Lozenge appearance="removed" isBold>
                {formatNokValue(spNokValue)}
              </Lozenge>
            ),
          },
          {
            key: "bpProfile",
            content: (
              <SpotlightTarget name="profile">
                <Select
                  options={benefitProfiles}
                  value={currentBP}
                  onChange={(option) =>
                    handleProfileChange(epicId, "bp", option as ProfileOption)
                  }
                  placeholder={t("analysis.table.placeholder_bp")}
                  spacing="compact"
                />
              </SpotlightTarget>
            ),
          },
          {
            key: "spProfile",
            content: (
              <Select
                options={costProfiles}
                value={currentSP}
                onChange={(option) =>
                  handleProfileChange(epicId, "sp", option as ProfileOption)
                }
                placeholder={t("analysis.table.placeholder_sp")}
                spacing="compact"
              />
            ),
          },
        ],
      };
    });
  }, [
    epicGoals,
    profileSelections,
    handleProfileChange,
    bpNokFactor,
    spNokFactor,
    benefitProfileMap,
    costProfileMap,
    benefitProfiles,
    costProfiles,
    t,
  ]);

  if (!epicGoals || epicGoals.length === 0) {
    return <div>{t("analysis.loading")}</div>;
  }

  const headerContainerStyles = xcss({
    display: "flex",
    alignItems: "center",
    marginBottom: "space.100",
  });

  return (
    <>
      <ModalTransition>
        {isModalOpen && (
          <Modal onClose={closeModal}>
            <ModalHeader>
              <ModalTitle>{t("analysis.modal.title")}</ModalTitle>
            </ModalHeader>

            <EconomicConfig
              bpNokFactor={bpNokFactor}
              spNokFactor={spNokFactor}
              onFactorChange={handleFactorChange}
            />

            <ModalFooter>
              <Button appearance="primary" onClick={closeModal}>
                {t("analysis.modal.save")}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      <Box xcss={headerContainerStyles}>
        <h3 style={{ marginRight: "10px" }}>{t("analysis.table.title")}</h3>

        <Tooltip content={t("analysis.table.config_tooltip")}>
          <SpotlightTarget name="pointsToNok">
            <Button
              appearance="subtle"
              iconBefore={
                <CashIcon
                  color={token("color.text.success")}
                  size="medium"
                  label="Economic Config"
                />
              }
              onClick={openModal}
            />
          </SpotlightTarget>
        </Tooltip>
      </Box>

      <DynamicTable caption=" " head={head} rows={rows} />
      <SpotlightTarget name="first-table">
        <div />
      </SpotlightTarget>
    </>
  );
};
