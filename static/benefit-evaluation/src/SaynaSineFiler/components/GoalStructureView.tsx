import React from "react";
import { Text } from "@forge/react";
import { ObjectiveTableTree } from "./ObjectiveTableTree"; // Your Formål Table
import { BenefitTableTree } from "./BenefitTableTree"; // Your Planlagte Nyttevirkninger Table
import { ProductTableTree } from "./ProductTableTree"; // Your Produkt Table
import { useState } from "react";
import GoalDrawer2 from "../GoalDrawer2";

export const GoalStructureView = () => {
  // Define state for the drawer's context
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [context, setContext] = useState({
    parentId: "",
    goalType: "",
    category: "",
  });
  const [createGoalType, setCreateGoalType] = useState<string | null>(null);

  const handleOpenDrawer = (
    parentId: string,
    goalType: string,
    category?: string
  ) => {
    setContext({ parentId, goalType, category: category || "" });
    setIsDrawerOpen(true);
  };

  return (
    <div style={{ padding: "16px" }}>
      <h3>Medfin</h3>

      {/* 1. Formål (Objectives) */}
      <div style={{ marginBottom: "40px" }}>
        <ObjectiveTableTree />
      </div>

      {/* 2. Planlagte Nyttevirkninger (Benefits) */}
      <div style={{ marginBottom: "40px" }}>
        <BenefitTableTree onAddGoal={handleOpenDrawer} />
      </div>

      {/* 3. Produkt (Epics) */}
      <div style={{ marginBottom: "40px" }}>
        <ProductTableTree onAddGoal={handleOpenDrawer} />
      </div>

      {/* The Goal Creation Drawer */}
      <GoalDrawer2
        title="test"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        parentId={context.parentId}
        goalType={context.goalType}
        goalCategory={context.category}
      />
    </div>
  );
};
