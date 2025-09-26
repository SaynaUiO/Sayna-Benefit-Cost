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
  goalType: "Objective" | "Benefit" | "Epic" | string;
  isOpen: boolean;
  parentId?: string;
  onClose: (shouldRefresh?: boolean) => void;
};

// Initial state for all possible fields
interface FormData {
  name: string;
  description: string;
  timeEstimate?: number;
  costEstimate?: number;
}

// --- Component ---
const GoalDrawer2 = ({ title, goalType, isOpen, parentId, onClose }: Props) => {
  const [scope] = useAppContext();
  const api = useAPI();

  // Initialize all fields in a single state object
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    timeEstimate: undefined,
    costEstimate: undefined,
  });

  // Reset form data when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
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
    if (!formData.name || !formData.description) {
      alert("Title and Description are required.");
      return;
    }

    // Prepare GoalCollection data
    const goalData: GoalCollection2 = {
      id: uuidv4(),
      scopeId: scope.id,
      name: formData.name,
      description: formData.description,
      parentId: parentId || undefined,

      // Conditionally add Epic fields
      ...(goalType === "Epic" &&
        formData.timeEstimate !== undefined && {
          timeEstimate: formData.timeEstimate,
        }),
      ...(goalType === "Epic" &&
        formData.costEstimate !== undefined && {
          costEstimate: formData.costEstimate,
        }),
    };

    console.log("GoalDrawer: Attempting to save with goalData:", goalData);

    // NOTE: Uncomment and fix API call when ready:
    // try {
    //   await api.goalCollection.create(scope.id, goalData);
    //   console.log("Goal created:", goalData);
    //   onClose(true); // Close and refresh
    // } catch (err) {
    //   console.error("Failed to save goal:", err);
    //   onClose(false);
    // }

    // Temporary log/close for demonstration
    onClose(true);
  };

  // --- Conditional Field Renderer ---
  const renderEpicFields = () => (
    <>
      <TextField
        label="Time (t)"
        type="number"
        value={
          formData.timeEstimate === undefined
            ? ""
            : String(formData.timeEstimate)
        }
        //onChange={(e) => handleChange("timeEstimate", Number(e.target.value))} // <-- ADDED onChange
        placeholder="Estimated time in hours"
      />
      <TextField
        label="Cost (kr)"
        type="number"
        value={
          formData.costEstimate === undefined
            ? ""
            : String(formData.costEstimate)
        }
        //onChange={(e) => handleChange("costEstimate", Number(e.target.value))} // <-- ADDED onChange
        placeholder="Estimated cost in currency"
      />
    </>
  );

  // --- Main Render Function (Moved outside handleSave) ---
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
          <h2>{`Create New ${goalType} for ${parentId || "Root"}`}</h2>

          {/* 2. DESCRIPTION FIELD */}
          <TextField
            label="Description"
            value={formData.description}
            //onChange={(e) => handleChange("description", e.target.value)} // <-- Correct handler for description
            placeholder="Detailed description"
            style={{ minHeight: 80 }}
            isRequired
          />

          {/* 3. Conditional Epic Fields */}
          {goalType === "Epic" && renderEpicFields()}

          {/* 4. Placeholder for Status (using Select) and Date (DatePicker) - Removed for now, but ready to be added back */}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button appearance="primary" onClick={handleSave}>
              Create {goalType}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer2;
