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
import { GoalCollection2 } from "../types/goal2";

// 1. Define the Category Item structure (the new middle layer)
interface CategoryItem {
  id: BenefitCategory; // e.g., "Samfunnsmål"
  name: BenefitCategory;
  goals: GoalCollection2[]; // Children are the goals
}

interface BenefitRootItem {
  id: string;
  name: string;
  goals: CategoryItem[];
}

const CATEGORY_DROPDOWN_ITEMS = [
  { label: "Legg til Samfunnsmål", value: "Samfunnsmål" },
  { label: "Legg til Organisasjonsmål", value: "Organisasjonsmål" },
  { label: "Legg til Effektmål", value: "Effektmål" },
];

// Define the component props
interface BenefitTableTreeProps {
  data: GoalCollection2[];
  onAddGoal: (parentId: string, goalType: string, category: string) => void;
}

// --- Main Component ---
export const BenefitTableTree: React.FC<BenefitTableTreeProps> = ({
  onAddGoal,
  data,
}) => {
  // FIX 3: Update the implementation where you build the categories
  const liveCategories = CATEGORY_HEADERS.map((category) => ({
    id: category,
    name: category,
    goals: data.filter((goal) => goal.tier === category), // This line is correct
  }));

  const BENEFIT_ROOT_ITEM: BenefitRootItem = {
    id: "benefit-root",
    name: "Planlagte Nyttevirkninger",
    goals: liveCategories, // This now matches the new BenefitRootItem type
  };

  // Use the combined data structure
  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];
  // Define the Union Type for ALL possible items in the tree
  type TableItem = BenefitRootItem | CategoryItem | GoalCollection2;

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
          const isAbsoluteRoot = item.id === "benefit-root";
          const root = item as BenefitRootItem;

          // Safely extract properties
          // Safely check if the item is a container (Root or Category)
          const isContainer = (item as any).goals !== undefined;
          const isLiveGoal = !isContainer;

          // Safely get the children array, defaulting to []
          const children = isContainer
            ? (item as BenefitRootItem | CategoryItem).goals
            : [];

          const childrenArray =
            children && Array.isArray(children) ? children : [];

          const hasChildren = childrenArray.length > 0;

          const goal = item as GoalCollection2;

          return (
            <Row
              itemId={item.id}
              items={childrenArray}
              hasChildren={hasChildren}
            >
              <Cell>{isLiveGoal ? goal.id : item.name}</Cell>

              <Cell>{isLiveGoal ? goal.description : ""}</Cell>

              <Cell>{isLiveGoal ? `${goal.weight || 0}%` : ""}</Cell>
              <Cell></Cell>

              <Cell>
                {isAbsoluteRoot && (
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
