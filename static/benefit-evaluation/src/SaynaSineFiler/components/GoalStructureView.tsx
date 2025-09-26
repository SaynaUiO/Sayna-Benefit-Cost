import React from "react";
import { Text } from "@forge/react";
import { ObjectiveTableTree } from "./ObjectiveTableTree"; // Your Formål Table
import { BenefitTableTree } from "./BenefitTableTree"; // Your Planlagte Nyttevirkninger Table
import { ProductTableTree } from "./ProductTableTree"; // Your Produkt Table

export const GoalStructureView = () => {
  return (
    <div style={{ padding: "16px" }}>
      <h3>Medfin</h3>

      {/* 1. Formål (Objectives) */}
      <div style={{ marginBottom: "40px" }}>
        <ObjectiveTableTree />
      </div>

      {/* 2. Planlagte Nyttevirkninger (Benefits) */}
      <div style={{ marginBottom: "40px" }}>
        <BenefitTableTree />
      </div>

      {/* 3. Produkt (Epics) */}
      <div style={{ marginBottom: "40px" }}>
        <ProductTableTree />
      </div>
    </div>
  );
};
