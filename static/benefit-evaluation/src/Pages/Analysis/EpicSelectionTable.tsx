import React, { useMemo } from "react";
import DynamicTable from "@atlaskit/dynamic-table";
import Lozenge from "@atlaskit/lozenge";
import Select from "@atlaskit/select";
import { Goal } from "../../Models";
// Sørg for at du importerer alle nødvendige typer og konstanter
// OPPDATERT IMPORT
import {
  EpicProfileSelections,
  ProfileOption,
  // LEGG TIL DISSE FIRE IMPORTENE:
  benefitProfiles,
  costProfiles,
  benefitProfileMap,
  costProfileMap,
} from "./periodizationTypes";
import { SpotlightTarget } from "@atlaskit/onboarding";

// Definerer props for denne komponenten
interface EpicSelectionTableProps {
  epicGoals: Goal[] | null;
  profileSelections: EpicProfileSelections;
  handleProfileChange: (
    epicId: string,
    type: "bp" | "sp",
    selectedOption: ProfileOption | null
  ) => void;
}

// Head-definisjonen for Epic-tabellen
const head = {
  cells: [
    { key: "epic", content: "Epic", width: 15 }, // Økt bredde litt for lesbarhet
    { key: "bp", content: "Nyttepoeng (BP)", width: 10 },
    { key: "sp", content: "Kostnad (SP)", width: 10 },
    { key: "bpProfile", content: "Velg BP profil", width: 30 },
    { key: "spProfile", content: "Velg SP profil", width: 30 },
  ],
};

// ProfileOptionMap is imported from "./periodizationTypes" and reused here.

export const EpicSelectionTable: React.FC<EpicSelectionTableProps> = ({
  epicGoals,
  profileSelections,
  handleProfileChange,
}) => {
  // Flytter rad-genereringen inn i denne komponenten
  const rows = useMemo(() => {
    return epicGoals?.map((epic) => {
      const epicId = epic.id;

      // Henter de lagrede nøklene (string) fra state
      // Setter en fallback til standardprofiler, selv om Analysis.tsx burde håndtere defaults.
      const currentKeys = profileSelections[epicId] || {
        benefitProfileKey: benefitProfiles[0].value,
        costProfileKey: costProfiles[0].value,
      };

      // Konverterer nøkkelen tilbake til ProfileOption for Select-komponenten (visning)
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
                {String(epic.balancedPoints?.value || "")}
              </Lozenge>
            ),
          },
          {
            key: "sp",
            content: (
              <Lozenge appearance="success" isBold>
                {String(epic.issueCost?.cost || "")}
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
                  placeholder="Velg BP-profil..."
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
    benefitProfileMap,
    costProfileMap,
    benefitProfiles,
    costProfiles,
  ]);

  if (!epicGoals || epicGoals.length === 0) {
    return <div>Laster Epics eller ingen Epics funnet...</div>;
  }

  return (
    <>
      <DynamicTable
        caption="Liste over epics og profilvalg"
        head={head}
        rows={rows}
      />
      <SpotlightTarget name="first-table">
        <div></div>
      </SpotlightTarget>
    </>
  );
};
