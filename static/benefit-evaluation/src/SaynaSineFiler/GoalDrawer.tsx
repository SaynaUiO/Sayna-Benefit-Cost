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
import { GoalCollection, GoalTierTypeEnum } from "../Models";
import Button from "@atlaskit/button";
import Form, { Field, FormFooter, HelperMessage } from "@atlaskit/form";
import { useEffect, useCallback } from "react";
import Select, { type OptionsType } from "@atlaskit/select";

//Change name to GoalDrawer?
//This component is a dynamic drawer for addinf tier, adding subtask, and editing a goal

const mapGoalTypeToEnum = (type: string): GoalTierTypeEnum => {
  switch (type) {
    case "Formål":
      return GoalTierTypeEnum.FORMAAL;
    case "Prosjektets Nyttevirkning":
      return GoalTierTypeEnum.NYTTEVIRKNING;
    case "Prosjektets Produkt":
      return GoalTierTypeEnum.PRODUKT;
    case "Epic":
      return GoalTierTypeEnum.EPIC;
    default:
      return GoalTierTypeEnum.GOAL_COLLECTION;
  }
};

type Props = {
  title: string; // The title of the drawer (e.g., "Create Goal" or "Edit Goal")
  goalType: string; // The type of the goal (e.g., "Formål", "Epic")
  isOpen: boolean; // Whether the drawer is open
  parentId?: string; // Optional: The ID of the parent goal (for subtasks)
  onClose: (shouldRefresh?: boolean) => void; // Callback when the drawer is closed
  goalId?: string; // Optional: The ID of the goal being edited
  initialName?: string; // Optional: Initial name for editing
  initialDescription?: string; // Optional: Initial description for editing
};

const GoalDrawer = ({
  title,
  goalType,
  isOpen,
  parentId,
  onClose,
  goalId,
  initialName = "",
  initialDescription = "",
}: Props) => {
  const [name, setName] = useState<string>(initialName);
  const [description, setDescription] = useState<string>(initialDescription);
  const [status, setStatus] = useState<string>("To Do"); // Default status

  const [scope] = useAppContext();
  const api = useAPI();

  const handleSave = async () => {
    if (!name || name.length < 3) {
      alert("Name is required and must be at least 3 characters.");
      return;
    }

    if (!status || status.trim() === "") {
      alert("Status is required.");
      return;
    }

    const goalData: GoalCollection = {
      id: goalId || "0", // Use the provided goal ID for editing, or "0" for creating
      scopeId: scope.id,
      type: mapGoalTypeToEnum(goalType),
      name,
      description,
      tier: goalType,
      status,
      parentId: parentId || undefined, // Include parentId for creating subtasks
    };

    try {
      if (goalId) {
        // Editing an existing goal
        await api.goalCollection.update(goalId, goalData);
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

  useEffect(() => {
    if (isOpen) {
      setName(initialName || "");
      setDescription(initialDescription || "");
      setStatus("To Do"); // Reset status to default or initial value
    }
  }, [isOpen, initialName, initialDescription]);

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
              ? `Edit ${goalType}`
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
          <TextField
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="Enter title..."
          />

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
