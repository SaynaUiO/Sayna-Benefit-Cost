import React, { useCallback, useEffect } from "react";
import { Text } from "@forge/react";
import { ObjectiveTableTree } from "./ObjectiveTableTree"; // Your Formål Table
import { BenefitTableTree } from "./BenefitTableTree"; // Your Planlagte Nyttevirkninger Table
import { ProductTableTree } from "./ProductTableTree"; // Your Produkt Table
import { useState } from "react";
import GoalDrawer2 from "../GoalDrawer2";
import { GoalCollection2 } from "../types/goal2";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";

//Interface for organized data:
interface OrganizedGoalData {
  objectives: GoalCollection2[];
  benefits: GoalCollection2[];
  products: GoalCollection2[];
}

//Initial states:
const initialData: OrganizedGoalData = {
  objectives: [],
  benefits: [],
  products: [],
};

export const GoalStructureView = () => {
  const [scope] = useAppContext();
  const api = useAPI();

  //State to hold live data:
  const [goalData, setGoalData] = useState<OrganizedGoalData>(initialData);

  //State to edit data
  const [goalToEdit, setGoalToEdit] = useState<GoalCollection2 | null>(null); // <-- NEW STATE

  // Define state for the drawer's context
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [context, setContext] = useState({
    parentId: "",
    goalType: "",
    category: "",
  });

  const fetchAndOrganizeGoals = useCallback(async () => {
    if (!scope.id) return;

    try {
      const allGoals: GoalCollection2[] = await api.goalAPI.getAll(scope.id);

      const organizedData: OrganizedGoalData = allGoals.reduce(
        (acc, goal) => {
          switch (goal.goalType) {
            case "Objective":
              acc.objectives.push(goal);
              break;
            case "Benefit":
              acc.benefits.push(goal);
              break;
            case "Product":
              acc.products.push(goal);
              break;
            default:
              console.warn(`Goal with unknown goalType: ${goal.goalType}`);
          }
          return acc;
        },
        { objectives: [], benefits: [], products: [] } as OrganizedGoalData
      );

      setGoalData(organizedData);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      // Optionally set data to empty array or show error message
      setGoalData(initialData);
    }
  }, [scope.id, api.goal]); // Depend on scope.id and api.goalAPI

  //Data Load: :
  useEffect(() => {
    fetchAndOrganizeGoals();
  }, [fetchAndOrganizeGoals]);

  //For creating a goal:
  const handleOpenDrawer = (
    parentId: string,
    goalType: string,
    category?: string
  ) => {
    setContext({ parentId, goalType, category: category || "" });
    setGoalToEdit(null); // Clear any goal being edited
    setIsDrawerOpen(true);
  };

  //For editing a Goal:
  const handleEditGoal = (goal: GoalCollection2) => {
    setGoalToEdit(goal);
    setContext({
      parentId: goal.parentId || "N/A", // Use existing parentId
      goalType: goal.goalType,
      category: goal.tier, // Use tier as the category for Benefits/Products
    });
    setIsDrawerOpen(true);
  };

  //For deleting a Goal

  //Update Drawer
  const onCloseDrawer = useCallback(
    (shouldRefresh?: boolean) => {
      setIsDrawerOpen(false);
      setGoalToEdit(null); //Reset edit state
      if (shouldRefresh) {
        fetchAndOrganizeGoals(); // Fetch data again if successful save occurred
      }
    },
    [fetchAndOrganizeGoals]
  );

  return (
    <div style={{ padding: "16px" }}>
      <h3>Medfin</h3>

      {/* 1. Formål (Objectives) */}
      <div style={{ marginBottom: "40px" }}>
        <ObjectiveTableTree
          data={goalData.objectives}
          onAddGoal={handleOpenDrawer}
          onEditGoal={handleEditGoal}
        />
      </div>

      {/* 2. Planlagte Nyttevirkninger (Benefits) */}
      <div style={{ marginBottom: "40px" }}>
        <BenefitTableTree
          data={goalData.benefits}
          onAddGoal={handleOpenDrawer}
          onEditGoal={handleEditGoal}
        />
      </div>

      {/* 3. Produkt (Epics) */}
      <div style={{ marginBottom: "40px" }}>
        <ProductTableTree
          data={goalData.products}
          onAddGoal={handleOpenDrawer}
          onEditGoal={handleEditGoal}
        />
      </div>

      {/* The Goal Creation Drawer */}
      <GoalDrawer2
        title={context.category || context.goalType}
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        parentId={context.parentId}
        goalType={context.goalType}
        goalCategory={context.category}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};
