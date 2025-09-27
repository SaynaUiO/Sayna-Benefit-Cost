import React, { useState } from "react";
import {
  Drawer,
  DrawerSidebar,
  DrawerContent,
  DrawerCloseButton,
} from "@atlaskit/drawer/compiled";
import TextField from "@atlaskit/textfield";
import { useAppContext } from "../Contexts/AppContext";
import { useAPI } from "../Contexts/ApiContext";
import Button from "@atlaskit/button";
import { useEffect } from "react";
import Select from "@atlaskit/select";

//Ny interface jeg har laget:
import { GoalCollection2 } from "./types/goal2";
import { mapGoalTypeStringToEnum } from "./enums/goal";

import { v4 as uuidv4 } from "uuid";
import { DatePicker } from "@atlaskit/datetime-picker";

//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

type Props = {
  title: string;
  goalType: "Objective" | "Benefit" | "Product" | string;
  goalCategory?: string; //samfunnsmål...
  isOpen: boolean;
  parentId?: string;
  onClose: (shouldRefresh?: boolean) => void;
};

// Initial state for all possible fields
interface FormData {
  description: string;
  timeEstimate?: number;
  costEstimate?: number;
}

// --- Component ---
const GoalDrawer2 = ({
  title,
  goalType,
  goalCategory,
  isOpen,
  parentId,
  onClose,
}: Props) => {
  console.log("GoalDrawer Props:", { goalType, goalCategory, parentId });

  const [scope] = useAppContext();
  const api = useAPI();

  // Initialize all fields in a single state object
  const [formData, setFormData] = useState<FormData>({
    description: "",
    timeEstimate: undefined,
    costEstimate: undefined,
  });

  // Reset form data when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: "",
        timeEstimate: undefined,
        costEstimate: undefined,
      });
    }
  }, [isOpen]);

  // Generic handler for all text/number fields
  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Basic Validation
    if (!formData.description) {
      alert("Title and Description are required.");
      return;
    }

    //Determine correct tier based on goalType and goalCathegory
    let tierValue: string;

    if (goalType === "Benefit" && goalCategory) {
      tierValue = goalCategory; // e.g., "Samfunnsmål"
    } else if (goalType === "Product") {
      tierValue = "Epic"; // Default for Product
    } else if (goalType === "Objective") {
      tierValue = "Objective"; // Default for Objective
    } else {
      alert("Invalid goal type or missing category.");
      return;
    }

    //Prepare payload for API (GoalCollection)
    const goalData: GoalCollection2 = {
      id: uuidv4(),
      scopeId: scope.id,
      parentId: parentId || undefined,
      name: tierValue,
      description: formData.description,

      //Categories:
      goalType: goalType as "Objective" | "Benefit" | "Product",
      tier: tierValue,

      //Product fields:
      ...(goalType === "Product" && {
        timeEstimate: formData.timeEstimate,
        costEstimate: formData.costEstimate,
      }),

      //Weight: Puttr det i senere.
    };

    console.log("GoalDrawer: Attempting to save with goalData:", goalData);

    // NOTE: Uncomment and fix API call when ready:
    try {
      await api.goalAPI.create(scope.id, goalData);
      console.log("Goal created:", goalData);
      onClose(true);
    } catch (err) {
      console.error("Failed to save goal:", err);
      onClose(false);
    }
  };

  // --- Conditional Field Renderer ---
  const renderEpicFields = () => (
    <>
      <TextField
        label="Time"
        type="number"
        value={
          formData.timeEstimate === undefined
            ? ""
            : String(formData.timeEstimate)
        }
        onChange={(e) =>
          handleChange(
            "timeEstimate",
            Number((e.target as HTMLInputElement).value)
          )
        }
        placeholder="Estimated time in hours"
      />
      <TextField
        label="Cost"
        type="number"
        value={
          formData.costEstimate === undefined
            ? ""
            : String(formData.costEstimate)
        }
        onChange={(e) =>
          handleChange(
            "costEstimate",
            Number((e.target as HTMLInputElement).value)
          )
        }
        placeholder="Estimated cost in currency"
      />
    </>
  );

  // --- Main Render Function ---
  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => onClose(false)}
      label={`Create ${goalType}`}
    >
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
          <h2>{`Create New ${goalCategory || goalType} for ${
            parentId || "Root"
          }`}</h2>

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

          {/* 3. Conditional Epic Fields */}
          {goalType === "Product" && renderEpicFields()}

          {/* 4. Placeholder for Status (using Select) and Date (DatePicker) - Removed for now, but ready to be added back */}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button appearance="primary" onClick={handleSave}>
              Create {goalCategory || goalType}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer2;
