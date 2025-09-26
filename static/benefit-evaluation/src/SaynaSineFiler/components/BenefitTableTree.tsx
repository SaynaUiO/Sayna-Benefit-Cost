import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import { BenefitGoal, BenefitCategory } from "../types/benefit";
import { BENEFIT_GOALS } from "../data/benefitMockData";

// Define the three category headers we need to insert into the table
const CATEGORY_HEADERS: BenefitCategory[] = [
  "Samfunnsmål",
  "Organisasjonsmål",
  "Effektmål",
];

// 1. Define the Category Item structure (the new middle layer)
interface CategoryItem {
  id: BenefitCategory; // e.g., "Samfunnsmål"
  name: BenefitCategory;
  goals: BenefitGoal[]; // Children are the goals
}

interface BenefitRootItem {
  id: string;
  name: string;
  goals: CategoryItem[];
}

const BENEFIT_ROOT_ITEM: BenefitRootItem = {
  id: "benefit-root",
  name: "Planlagte Nyttevirkninger",
  goals: CATEGORY_HEADERS.map((category) => ({
    id: category, // Use the category name as the unique ID for this row
    name: category,
    // Filter the main goal list to find goals that belong to this category
    goals: BENEFIT_GOALS.filter((goal) => goal.category === category),
  })),
};

// --- Main Component ---
export const BenefitTableTree = () => {
  // Use the combined data structure
  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];

  // Define the Union Type for ALL possible items in the tree
  type TableItem = BenefitRootItem | CategoryItem | BenefitGoal;

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Mål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}>Weight %</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          // Determine the item type
          const isBenefitGoal = (item as BenefitGoal).weight !== undefined;
          const isCategory =
            !isBenefitGoal && (item as CategoryItem).goals !== undefined;
          const isRoot = !isBenefitGoal && !isCategory;

          // Safely extract properties
          const goal = item as BenefitGoal;
          const container = item as BenefitRootItem | CategoryItem;

          // Determine children array for nesting
          const children = isBenefitGoal ? [] : container.goals;
          const hasChildren = children.length > 0;

          return (
            <Row itemId={item.id} items={children} hasChildren={hasChildren}>
              <Cell>
                {/* Display Goal ID (O1, EFF1) or Header Name (Samfunnsmål) */}
                {isBenefitGoal ? goal.id : item.name}
              </Cell>

              {/* Description Column */}
              <Cell>{isBenefitGoal ? goal.description : ""}</Cell>

              {/* Weight % Column */}
              <Cell>{isBenefitGoal ? `${goal.weight}%` : ""}</Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
