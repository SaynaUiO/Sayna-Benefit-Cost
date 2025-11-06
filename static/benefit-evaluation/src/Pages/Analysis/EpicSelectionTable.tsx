import React, { useMemo, useState } from "react";
import DynamicTable from "@atlaskit/dynamic-table";
import Lozenge from "@atlaskit/lozenge";
import Select from "@atlaskit/select";
import { Goal } from "../../Models";
import {
  EpicProfileSelections,
  ProfileOption,
  benefitProfiles,
  costProfiles,
  benefitProfileMap,
  costProfileMap,
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

// *OPPDATERTE PROPS*
interface EpicSelectionTableProps {
  epicGoals: Goal[] | null;
  profileSelections: EpicProfileSelections;
  handleProfileChange: (
    epicId: string,
    type: "bp" | "sp",
    selectedOption: ProfileOption | null
  ) => void;
  // *NYE PROPS FOR NOK-BEREGNING*
  bpNokFactor: number;
  spNokFactor: number;
  handleFactorChange: (factorType: "bp" | "sp", newValue: number) => void;
}

// *OPPDATERT HEAD-DEFINISJON*
const head = {
  cells: [
    { key: "epic", content: "Epic", width: 10 },
    { key: "bp", content: "Nyttepoeng (BP)", width: 10 },
    { key: "bpNok", content: "Nytteverdi (Mill. NOK)", width: 15 }, // NY KOLONNE
    { key: "sp", content: "Kostnad (SP)", width: 10 },
    { key: "spNok", content: "Kostnad (Mill. NOK)", width: 15 }, // NY KOLONNE
    { key: "bpProfile", content: "Velg BP profil", width: 20 },
    { key: "spProfile", content: "Velg SP profil", width: 20 },
  ],
};

export const EpicSelectionTable: React.FC<EpicSelectionTableProps> = ({
  epicGoals,
  profileSelections,
  handleProfileChange,
  // Tar imot de nye konverteringsfaktorene
  bpNokFactor,
  spNokFactor,
  handleFactorChange, // Ny funksjon
}) => {
  // *NY STATE* for å kontrollere Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Funksjon for å formatere tallet til én desimal
  const formatNokValue = (value: number) => {
    // Sikrer at 0 eller veldig små verdier vises pent
    if (isNaN(value) || value === 0) return "0.0";
    return value.toFixed(2).replace(".", ",");
  };

  // Flytter rad-genereringen inn i denne komponenten
  const rows = useMemo(() => {
    return epicGoals?.map((epic) => {
      const epicId = epic.id;

      // Henter de rå BP og SP verdiene
      const rawBP = epic.balancedPoints?.value || 0;
      const rawSP = epic.issueCost?.cost || 0;

      // *BEREGNING AV NOK-VERDIER*
      const bpNokValue = rawBP * bpNokFactor;
      const spNokValue = rawSP * spNokFactor;

      // Henter profilvalg... (Uendret logikk)
      const currentKeys = profileSelections[epicId] || {
        benefitProfileKey: benefitProfiles[0].value,
        costProfileKey: costProfiles[0].value,
      };
      const currentBP = benefitProfileMap[currentKeys.benefitProfileKey];
      const currentSP = costProfileMap[currentKeys.costProfileKey];

      return {
        key: epicId,
        cells: [
          { key: "epic", content: epic.key },
          // BP (Nyttepoeng)
          {
            key: "bp",
            content: (
              <Lozenge appearance="new" isBold>
                {String(rawBP)}
              </Lozenge>
            ),
          },
          // *NY KOLONNE: Nytteverdi (NOK)*
          {
            key: "bpNok",
            content: (
              <Lozenge appearance="inprogress" isBold>
                {formatNokValue(bpNokValue)}
              </Lozenge>
            ),
          },
          // SP (Kostnad)
          {
            key: "sp",
            content: (
              <Lozenge appearance="success" isBold>
                {String(rawSP)}
              </Lozenge>
            ),
          },
          // *NY KOLONNE: Kostnad (NOK)*
          {
            key: "spNok",
            content: (
              <Lozenge appearance="removed" isBold>
                {formatNokValue(spNokValue)}
              </Lozenge>
            ),
          },
          // BP Profil (Uendret logikk)
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
                  placeholder="Velg BP-profil..."
                  spacing="compact"
                />
              </SpotlightTarget>
            ),
          },
          // SP Profil (Uendret logikk)
          {
            key: "spProfile",
            content: (
              <Select
                options={costProfiles}
                value={currentSP}
                onChange={(option) =>
                  handleProfileChange(epicId, "sp", option as ProfileOption)
                }
                placeholder="Velg SP-profil..."
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
    bpNokFactor, // Legg til som avhengighet
    spNokFactor, // Legg til som avhengighet
    benefitProfileMap,
    costProfileMap,
    benefitProfiles,
    costProfiles,
  ]);

  if (!epicGoals || epicGoals.length === 0) {
    return <div>Laster Epics eller ingen Epics funnet...</div>;
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
              <ModalTitle> Konverter poeng til NOK (Millioner)</ModalTitle>
            </ModalHeader>

            {/* INKLUDERER ECONOMIC CONFIG INNE I MODALEN */}
            <EconomicConfig
              bpNokFactor={bpNokFactor}
              spNokFactor={spNokFactor}
              onFactorChange={handleFactorChange}
            />

            <ModalFooter>
              <Button appearance="primary" onClick={closeModal}>
                Lagre
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      {/* Container for Tittel og Ikon (Løsning på Steg 1) */}
      <Box xcss={headerContainerStyles}>
        <h3 style={{ marginRight: "10px" }}>Liste over epics og profilvalg</h3>

        {/* CashIcon-knappen, som åpner Modalen */}
        <Tooltip content="Konverter poeng til NOK">
          <SpotlightTarget name="pointsToNok">
            <Button
              appearance="subtle"
              iconBefore={
                <CashIcon
                  color={token("color.text.success")}
                  size="medium"
                  label="Økonomisk konfigurering"
                />
              }
              onClick={openModal} // Åpner Modalen
            ></Button>
          </SpotlightTarget>
        </Tooltip>
      </Box>

      <DynamicTable caption=" " head={head} rows={rows} />
      <SpotlightTarget name="first-table">
        <div></div>
      </SpotlightTarget>
    </>
  );
};
