import React, { useState } from "react";
import {
  Drawer,
  DrawerSidebar,
  DrawerContent,
  DrawerCloseButton,
} from "@atlaskit/drawer/compiled";
import TextField from "@atlaskit/textfield";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import Button from "@atlaskit/button";
import { useEffect } from "react";
import { CostTime, Goal, GoalTypeEnum } from "../../Models";
import { v4 as uuidv4 } from "uuid";
import { useGoalForm } from "../hooks/useGoalDrawer";

//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

const EFFEKTMAAL_ID = "root-effektmaal";
const ORGANISASJONSMAAL_ID = "root-organisasjonsmaal";
const SAMFUNNSMAAL_ID = "root-samfunnsmaal";

const getGoalCategoryDisplayName = (categoryId: string): string => {
  switch (categoryId) {
    case EFFEKTMAAL_ID:
      return "Effektmål";
    case ORGANISASJONSMAAL_ID:
      return "Organisasjonsmål";
    case SAMFUNNSMAAL_ID:
      return "Samfunnsmål";
    default:
      return categoryId
        .replace("root-", "")
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
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

  // 1. Bruker den nye hooken for all logikk og state!
  const { formData, isSubmitting, handleChange, handleSave } =
    useGoalForm(props);

  // --- UI Tekst Logikk (Beholdt for ren visning) ---

  const categoryDisplayName = goalCategory
    ? getGoalCategoryDisplayName(goalCategory)
    : goalType === "Benefit"
    ? "Nyttevirkning"
    : goalType;

  const finalDisplayName = categoryDisplayName
    .replace("Product", "Epic")
    .replace("Objective", "Formål");

  const drawerTitle = goalToEdit
    ? `Endre ${goalToEdit.id}`
    : `Opprett nytt ${finalDisplayName}`;

  const buttonText = goalToEdit
    ? "Lagre endringer"
    : `Create ${goalCategory || goalType}`;

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

          {/* 2. DESCRIPTION FIELD */}
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              handleChange("description", (e.target as HTMLInputElement).value)
            }
            placeholder="Detailed description"
            style={{ minHeight: 80 }}
            isRequired
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              appearance="primary"
              onClick={handleSave}
              isDisabled={isSubmitting} // Bruk state fra hooken
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
