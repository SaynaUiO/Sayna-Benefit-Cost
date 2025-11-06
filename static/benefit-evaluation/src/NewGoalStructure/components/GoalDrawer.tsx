import React, { useState } from "react";
import {
  Drawer,
  DrawerSidebar,
  DrawerContent,
  DrawerCloseButton,
} from "@atlaskit/drawer/compiled";
import TextField from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import {} from "react";
import { Goal } from "../../Models";
import { useGoalForm } from "../hooks/useGoalDrawer";
import {
  NYTTE_COLLECTION_ID,
  ROOT_COLLECTION_DATA,
} from "../constants/goalConstants";
import TextArea from "@atlaskit/textarea";
import { Field } from "@atlaskit/form";

//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

const getGoalCategoryDisplayName = (categoryId: string): string => {
  const data = ROOT_COLLECTION_DATA.find((d) => d.id === categoryId);
  if (data) {
    return data.name;
  }
  return categoryId
    .replace("root-", "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

// --- Props (Beholdt) ---

type Props = {
  title: string;
  goalType: "Objective" | "Benefit" | "Product" | string;
  goalCategory?: string;
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  goalToEdit?: Goal | null;
};

// --- Component ---
const GoalDrawer = (props: Props) => {
  const { goalType, goalCategory, isOpen, onClose, goalToEdit } = props;

  // Bruker hooken for all logikk og state!
  const { formData, isSubmitting, handleChange, handleSave } =
    useGoalForm(props);

  // --- UI Tekst Logikk (Rensket og Konsistent) ---

  const categoryDisplayName = goalCategory
    ? getGoalCategoryDisplayName(goalCategory)
    : goalType === "Benefit"
    ? "Nyttevirkning"
    : goalType;

  // Bruker en replace-kjede for å sikre korrekte visningsnavn for typene
  const finalDisplayName = categoryDisplayName
    .replace("Product", "Epic")
    .replace("Objective", "Formål");

  const drawerTitle = goalToEdit
    ? `Endre ${goalToEdit.key || goalToEdit.id}`
    : `Opprett ${finalDisplayName}`;

  const buttonText = goalToEdit ? "Lagre endringer" : `Opprett `;

  // --- Hoved Render Funksjon ---
  return (
    <Drawer isOpen={isOpen} onClose={() => onClose(false)} label={drawerTitle}>
      <DrawerSidebar>
        <DrawerCloseButton />
      </DrawerSidebar>
      <DrawerContent>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <h2>{drawerTitle}</h2>

          {/* DESCRIPTION FIELD */}
          <Field name="description" label="Beskrivelse" isRequired>
            {({ fieldProps }) => (
              // @ts-ignore
              <TextArea
                {...fieldProps}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Detaljert beskrivelse...."
                minimumRows={4}
                resize="vertical"
              />
            )}
          </Field>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              appearance="primary"
              onClick={handleSave}
              isDisabled={isSubmitting}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer;
