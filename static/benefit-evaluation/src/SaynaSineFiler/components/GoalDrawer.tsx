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

//Ny interface jeg har laget:
import { Goals } from "../types/goal";

import { v4 as uuidv4 } from "uuid";

//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

type Props = {
  title: string;
  goalType: "Objective" | "Benefit" | "Product" | string;
  goalCategory?: string; //samfunnsmål...
  isOpen: boolean;
  parentId?: string;
  onClose: (shouldRefresh?: boolean) => void;
  goalToEdit?: Goals | null;
};

// Initial state for all possible fields
interface FormData {
  description: string;
  timeEstimate?: number;
  costEstimate?: number;
}

// --- Component ---
const GoalDrawer = ({
  title,
  goalType,
  goalCategory,
  isOpen,
  parentId,
  onClose,
  goalToEdit,
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
      if (goalToEdit) {
        //Edit
        setFormData({
          description: goalToEdit.description || "",
          timeEstimate: goalToEdit.timeEstimate ?? undefined,
          costEstimate: goalToEdit.costEstimate ?? undefined,
        });
      } else {
        //Create/Add
        setFormData({
          description: "",
          timeEstimate: undefined,
          costEstimate: undefined,
        });
      }
    }
  }, [isOpen, goalToEdit]);

  // Generic handler for all text/number fields
  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    //Determine if we are creating/adding or editing
    const isEditing = !!goalToEdit; //Does it have data?

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
    const goalData: Goals = {
      id: isEditing ? goalToEdit!.id : uuidv4(), //use existing ID if editing. if adding, create new id
      scopeId: scope.id,
      parentId: isEditing ? goalToEdit!.parentId : parentId || undefined, //use existing parentId if editing. if adding, create new
      name: tierValue, // Note: You might want to use goalToEdit!.name if editing, but tierValue is fine for now as they are often the same
      description: formData.description,

      //Categories:
      goalType: goalType as "Objective" | "Benefit" | "Product",
      tier: tierValue,

      timeEstimate: formData.timeEstimate,
      costEstimate: formData.costEstimate,

      //Weight: Puttr det i senere.
    };

    console.log("GoalDrawer: Attempting to save with goalData:", goalData);

    // API call:
    try {
      if (isEditing) {
        //Call EDIT API endpoint
        await api.goalAPI.update(scope.id, goalData);
        console.log("Goal updated:", goalData);
      } else {
        //Call CREATE API endpoint
        await api.goalAPI.create(scope.id, goalData);
        console.log("Goal created:", goalData);
      }
      onClose(true);
    } catch (err) {
      console.error("Failed to save goal:", err);
      // NOTE: You should ideally show the user an error message, not just close
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

  //Update Title:
  const drawerTitle = goalToEdit
    ? `Endre ${goalToEdit.name}`
    : `Opprett ny ${goalCategory || goalType}`;

  //Update Button Text:
  const buttonText = goalToEdit
    ? "Lagre endringer"
    : `Create ${goalCategory || goalType}`;

  // --- Main Render Function ---
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

          {/* 3. Conditional Epic Fields */}
          {goalType === "Product" && renderEpicFields()}

          {/* 4. Placeholder for Status (using Select) and Date (DatePicker) - Removed for now, but ready to be added back */}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button appearance="primary" onClick={handleSave}>
              {buttonText} {/* <-- dynamic button */}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer;
