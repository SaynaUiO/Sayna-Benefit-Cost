import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import { BenefitCategory } from "../types/benefit";
import AddBenefitGoalDropdownButton from "./AddBenefitGoalDropdown";
import { formatGoalID } from "../utils/goalIdFormatter";
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";

// Define the three category headers we need to insert into the table
const CATEGORY_HEADERS: BenefitCategory[] = [
  "Samfunnsmål",
  "Organisasjonsmål",
  "Effektmål",
];
import { Goals } from "../types/goal";
import Button from "@atlaskit/button";

interface CategoryItem {
  id: BenefitCategory; // e.g., "Samfunnsmål"
  name: BenefitCategory;
  goals: Goals[]; // Children are the goals
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
  data: Goals[];
  onAddGoal: (parentId: string, goalType: string, category: string) => void;
  onEditGoal: (goal: Goals) => void;
  onDeleteGoal: (goalId: string) => void;
}

// --- Main Component ---
export const BenefitTableTree: React.FC<BenefitTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data,
}) => {
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

  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];
  type TableItem = BenefitRootItem | CategoryItem | Goals;

  // Handler to bridge the dropdown component's output to the main GoalStructureView handler
  const handleCategorySelect = (category: string, parentId?: string) => {
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

          const isContainer = (item as any).goals !== undefined;
          const isLiveGoal = !isContainer;

          const children = isContainer
            ? (item as BenefitRootItem | CategoryItem).goals
            : [];

          const childrenArray =
            children && Array.isArray(children) ? children : [];

          const hasChildren = childrenArray.length > 0;

          const goal = item as Goals;

          return (
            <Row
              itemId={item.id}
              items={childrenArray}
              hasChildren={hasChildren}
            >
              <Cell>{isLiveGoal ? formatGoalID(goal) : item.name}</Cell>

              <Cell>{isLiveGoal ? goal.description : ""}</Cell>

              <Cell>{isLiveGoal ? `${goal.weight || 0}%` : ""}</Cell>
              <Cell></Cell>

              <Cell>
                {/* Add button */}
                {isAbsoluteRoot && (
                  <AddBenefitGoalDropdownButton
                    buttonLabel="+"
                    dropdownItems={CATEGORY_DROPDOWN_ITEMS}
                    onTypeSelectedForCreation={handleCategorySelect} // USE NEW PROP HERE
                    isPrimary={false}
                    parentId={root.id} // Pass the parent ID dynamically
                  />
                )}

                {/* Edit Button  */}
                {isLiveGoal && (
                  <Button
                    appearance="subtle"
                    iconBefore={<EditIcon size="small" label="Edit Goal" />}
                    onClick={() => {
                      onEditGoal(goal);
                    }}
                  ></Button>
                )}

                {/* Delete Button  */}
                {isLiveGoal && (
                  <Button
                    appearance="subtle"
                    iconBefore={<TrashIcon size="small" label="Delete Goal" />}
                    onClick={() => onDeleteGoal(goal.id)}
                  ></Button>
                )}
              </Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
