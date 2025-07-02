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
//import { GoalCollection, GoalTierTypeEnum } from "../Models";
import Button from "@atlaskit/button";
import Form, { Field, FormFooter, HelperMessage } from "@atlaskit/form";
import { useEffect, useCallback } from "react";
import Select, { type OptionsType } from "@atlaskit/select";

//Ny interface jeg har laget:
import { GoalCollection } from "./types/goal";
import {
  GoalTierTypeEnum,
  mapGoalTypeStringToEnum,
  mapEnumToGoalTypeString,
} from "./enums/goal";

//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

//Dette fjernes:
// const mapGoalTypeToEnum = (type: string): GoalTierTypeEnum => {
//   switch (type) {
//     case "Formål":
//       return GoalTierTypeEnum.FORMAAL;
//     case "Prosjektets Nyttevirkning":
//       return GoalTierTypeEnum.NYTTEVIRKNING;
//     case "Prosjektets Produkt":
//       return GoalTierTypeEnum.PRODUKT;
//     case "Epic":
//       return GoalTierTypeEnum.EPIC;
//     default:
//       return GoalTierTypeEnum.GOAL_COLLECTION;
//   }
// };

// const mapEnumToGoalType = (enumValue: GoalTierTypeEnum): string => {
//   switch (enumValue) {
//     case GoalTierTypeEnum.FORMAAL:
//       return "Formål";
//     case GoalTierTypeEnum.NYTTEVIRKNING:
//       return "Prosjektets Nyttevirkning";
//     case GoalTierTypeEnum.PRODUKT:
//       return "Prosjektets Produkt";
//     case GoalTierTypeEnum.EPIC:
//       return "Epic";
//     default:
//       return "Unknown";
//   }
// };

type Props = {
  title: string; // The title of the drawer (e.g., "Create Goal" or "Edit Goal")
  goalType: string; // The type of the goal (e.g., "Formål", "Epic")
  isOpen: boolean; // Whether the drawer is open
  parentId?: string; // Optional: The ID of the parent goal (for subtasks)
  onClose: (shouldRefresh?: boolean) => void; // Callback when the drawer is closed
  goalId?: string; // Optional: The ID of the goal being edited
  initialName?: string; // Optional: Initial name for editing
  initialDescription?: string; // Optional: Initial description for editing
  initialStatus?: string; // Optional: Initial status for editing
};

const GoalDrawer = ({
  title,
  goalType, //String representation of f.eks formål, epic, etc.
  isOpen,
  parentId,
  onClose,
  goalId,
  initialName = "",
  initialDescription = "",
  initialStatus = "To Do", // Default status for new goals
}: Props) => {
  const [name, setName] = useState<string>(initialName);
  const [description, setDescription] = useState<string>(initialDescription);
  const [status, setStatus] = useState<string>(initialStatus); // Default status

  const [scope] = useAppContext();
  const api = useAPI();

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setStatus(initialStatus);
  }, [isOpen, initialName, initialDescription, initialStatus]); // Dependencies trigger reset/load

  const handleSave = async () => {
    // if (!name || name.trim() === "") {
    //   alert("name is required");
    //   return;
    // } //Dette er for name is required, men jeg vil kanskej ikke ha mae, bare description
    if (!status || status.trim() === "") {
      alert("Status is required.");
      return;
    }

    // Prepare GoalCollection data to send to backend
    const goalData: GoalCollection = {
      id: goalId || "0", // Use the provided goal ID for editing, or "0" for creating
      scopeId: scope.id,
      type: mapGoalTypeStringToEnum(goalType),
      name: name,
      description: description,
      status: status,
      tier: goalType,
      parentId: parentId || undefined, // Include parentId for creating subtasks
    };

    console.log("GoalDrawer: Attempting to save with goalData:", goalData); // This should appear now!

    try {
      if (goalId) {
        // Editing an existing goal
        await api.goalCollection.update(scope.id, goalData);
        console.log("Goal updated:", goalData);
      } else {
        // Creating a new goal
        await api.goalCollection.create(scope.id, goalData);
        console.log("Goal created:", goalData);
      }
      onClose(true); // Close the drawer and refresh
    } catch (err) {
      console.error("Failed to save goal:", err);
      onClose(false); // Close the drawer without refreshing
    }
  };

  // useEffect(() => {
  //   setName(initialName || "");
  //   setDescription(initialDescription || "");
  //   setStatus("To Do"); // Reset status to default or initial value
  //   // Map the goalType enum to its string name for display
  //   if (goalType) {
  //     const mappedGoalType = mapEnumToGoalType(mapGoalTypeToEnum(goalType));
  //     setName(mappedGoalType); // Set the mapped name
  //   }
  // }, [isOpen, initialName, initialDescription]);

  const statusOptions = [
    { label: "To Do", value: "To Do" },
    { label: "In Progress", value: "In Progress" },
    { label: "Done", value: "Done" },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => onClose(false)}
      label={goalId ? `Edit ${goalType}` : `Create ${goalType}`}
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
          <h2>
            {goalId
              ? `${title}`
              : parentId
              ? `Add Subtast to ${goalType}`
              : `Create New ${goalType}`}
          </h2>
          <p>
            {goalId
              ? `Edit the details of the ${goalType}.`
              : parentId
              ? `This is where you add a subtask to the ${goalType}.`
              : `This is where you create a new ${goalType}.`}
          </p>
          {/* <TextField
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="Enter title..."
          /> */}

          <TextField
            value={description}
            onChange={(e) =>
              setDescription((e.target as HTMLTextAreaElement).value)
            }
            placeholder="Enter description..."
            style={{ minHeight: 80 }}
          />

          <Select
            options={statusOptions}
            value={statusOptions.find((option) => option.value === status)}
            onChange={(selectedOption) =>
              setStatus(selectedOption?.value || "To Do")
            }
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button appearance="primary" onClick={handleSave}>
              {goalId ? "Save Changes" : parentId ? "Add Subtask" : "Create"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer;
