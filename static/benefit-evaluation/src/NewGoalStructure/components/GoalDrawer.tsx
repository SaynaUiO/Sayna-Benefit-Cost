import React from "react";
import {
  Drawer,
  DrawerSidebar,
  DrawerContent,
  DrawerCloseButton,
} from "@atlaskit/drawer/compiled";
import Button from "@atlaskit/button";
import { Goal } from "../../Models";
import { useGoalForm } from "../hooks/useGoalDrawer";
import { ROOT_COLLECTION_DATA } from "../constants/goalConstants";
import TextArea from "@atlaskit/textarea";
import { Field } from "@atlaskit/form";
import { useTranslation } from "@forge/react";

// --- Props ---
type Props = {
  title: string;
  goalType: "Objective" | "Benefit" | "Product" | string;
  goalCategory?: string;
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  goalToEdit?: Goal | null;
};

const GoalDrawer = (props: Props) => {
  const { goalType, goalCategory, isOpen, onClose, goalToEdit } = props;
  const { t } = useTranslation();

  const { formData, isSubmitting, handleChange, handleSave } =
    useGoalForm(props);

  // --- Translation Logic ---

  // 1. Get the display name for the type/category
  const getDisplayName = () => {
    // If it's a specific category from ROOT_COLLECTION_DATA
    if (goalCategory) {
      const data = ROOT_COLLECTION_DATA.find((d) => d.id === goalCategory);
      if (data) return data.name; // Note: You might want to translate these names too later
    }

    // Fallback to standard types
    if (goalType === "Product") return t("drawer.types.Product");
    if (goalType === "Objective") return t("drawer.types.Objective");
    if (goalType === "Benefit") return t("drawer.types.Benefit");

    return goalType;
  };

  const finalDisplayName = getDisplayName();

  // 2. Dynamic Titles and Button labels using Option 2 (Manual Concatenation)
  const drawerTitle = goalToEdit
    ? `${t("drawer.edit_prefix")} ${goalToEdit.key || goalToEdit.id}`
    : `${t("drawer.create_prefix")} ${finalDisplayName}`;

  const buttonText = goalToEdit
    ? t("drawer.save_changes")
    : t("drawer.create_prefix");

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

          <Field
            name="description"
            label={t("drawer.description_label")}
            isRequired
          >
            {({ fieldProps }) => (
              // @ts-ignore
              <TextArea
                {...fieldProps}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t("drawer.description_placeholder")}
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
