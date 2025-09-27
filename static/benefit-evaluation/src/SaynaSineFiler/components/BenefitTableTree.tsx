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
import DropdownMenu, {
  DropdownItemGroup,
  DropdownItem,
} from "@atlaskit/dropdown-menu";
import AddBenefitGoalDropdownButton from "../AddBenefitGoalDropdown";
// Define the three category headers we need to insert into the table
const CATEGORY_HEADERS: BenefitCategory[] = [
  "Samfunnsmål",
  "Organisasjonsmål",
  "Effektmål",
];
import { GOAL_TYPE_DROPDOWN_ITEMS2 } from "../goalDropdownItems2";
import { Button } from "@forge/react"; // <-- Import Button

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

const CATEGORY_DROPDOWN_ITEMS = [
  { label: "Legg til Samfunnsmål", value: "Samfunnsmål" },
  { label: "Legg til Organisasjonsmål", value: "Organisasjonsmål" },
  { label: "Legg til Effektmål", value: "Effektmål" },
];

// Define the component props
interface BenefitTableTreeProps {
  // The handler will receive the category (value) and the parentId ("benefit-root")
  onAddGoal: (parentId: string, goalType: string, category: string) => void;
}

// --- Main Component ---
export const BenefitTableTree: React.FC<BenefitTableTreeProps> = ({
  onAddGoal,
}) => {
  // Use the combined data structure
  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];
  // Define the Union Type for ALL possible items in the tree
  type TableItem = BenefitRootItem | CategoryItem | BenefitGoal;

  // Handler to bridge the dropdown component's output to the main GoalStructureView handler
  const handleCategorySelect = (category: string, parentId?: string) => {
    // Goal type is fixed as "Benefit" here
    onAddGoal(parentId || "benefit-root", "Benefit", category);
  };

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Mål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}>Weight %</Header>
        <Header width={530}></Header>
        <Header width={120}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          // Determine the item type
          const isBenefitGoal = (item as BenefitGoal).weight !== undefined;
          const isAbsoluteRoot = item.id === "benefit-root";
          const isCategory =
            !isBenefitGoal &&
            !isAbsoluteRoot &&
            (item as CategoryItem).goals !== undefined;
          const isRoot = !isBenefitGoal && !isCategory;
          const root = item as BenefitRootItem;

          // Safely extract properties
          const goal = item as BenefitGoal;
          const container = item as BenefitRootItem | CategoryItem;

          // Determine children array for nesting
          const children = isBenefitGoal ? [] : container.goals;
          const hasChildren = children.length > 0;

          return (
            <Row itemId={item.id} items={children} hasChildren={hasChildren}>
              <Cell>{isBenefitGoal ? goal.id : item.name}</Cell>

              <Cell>{isBenefitGoal ? goal.description : ""}</Cell>

              <Cell>{isBenefitGoal ? `${goal.weight}%` : ""}</Cell>
              <Cell></Cell>

              <Cell>
                {isRoot && (
                  <AddBenefitGoalDropdownButton
                    buttonLabel="+"
                    dropdownItems={CATEGORY_DROPDOWN_ITEMS}
                    onTypeSelectedForCreation={handleCategorySelect} // USE NEW PROP HERE
                    isPrimary={false}
                    parentId={root.id} // Pass the parent ID dynamically
                  />
                )}
              </Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
