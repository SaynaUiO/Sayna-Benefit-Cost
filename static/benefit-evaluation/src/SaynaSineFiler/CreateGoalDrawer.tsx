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
  title: string;
  goalType: string;
  isOpen: boolean;
  parentId?: string;
  onClose: (shouldRefresh?: boolean) => void;
};

const GoalDrawer = ({ title, goalType, isOpen, parentId, onClose }: Props) => {
  const [inputValue, setInputValue] = useState<string>("");
  const type = mapGoalTypeToEnum(goalType);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [scope] = useAppContext();
  const api = useAPI();

  const [goalTiers, setGoalTiers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        const results = await api.goalTier.getAll(scope.id, scope.type);
        setGoalTiers(results);
      }
    };
    fetchData();
  }, [isOpen, scope.id, scope.type]);

  const handleCreate = async () => {
    if (!name || name.length < 3) {
      alert("Name is required and must be at least 3 characters.");
      return;
    }

    const newGoal: GoalCollection = {
      id: "0", //let backend assign actual ID if needed
      scopeId: scope.id,
      type: GoalTierTypeEnum.GOAL_COLLECTION,
      name,
      description,
      tier: goalType,
      parentId, // 👈 store the parentId
    };

    try {
      await api.goalCollection.create(scope.id, newGoal);
      onClose(true); //close and refesh
    } catch (err) {
      console.error("Faield to create goal:", err);
      onClose;
    }
  };

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
          <h2>{title}</h2>
          <p>
            This is where you create a new <strong>{goalType}</strong>.
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

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button appearance="primary" onClick={handleCreate}>
              Save
            </Button>
          </div>

          {goalTiers.length > 0 && (
            <pre
              className="text-xs mt-4 bg-gray-100 p-2"
              style={{ maxHeight: 300, overflow: "auto" }}
            >
              {JSON.stringify(goalTiers, null, 2)}
            </pre>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalDrawer;
