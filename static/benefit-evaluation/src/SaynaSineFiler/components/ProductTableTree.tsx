import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import { Epic } from "../types/Epic";
import { PRODUCT_GOALS } from "../data/productMockData";
import Button from "@atlaskit/button";
import AddIcon from "@atlaskit/icon/glyph/add";
import { GoalCollection2 } from "../types/goal2";
import { formatGoalID } from "../types/goalIdFormatter";
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";

// 1. Define the Root Container Type
interface ProductRootItem {
  id: string;
  name: string;
  goals: GoalCollection2[];
}

interface ProductTableTreeProps {
  data: GoalCollection2[];
  onAddGoal: (parentId: string, goalType: string, category?: string) => void;
  onEditGoal: (goal: GoalCollection2) => void;
  onDeleteGoal: (goalId: string) => void;
}

// 2. Define the Union Type for Items
type TableItem = ProductRootItem | GoalCollection2;

export const ProductTableTree: React.FC<ProductTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data,
}) => {
  const PRODUCT_ROOT_ITEM: ProductRootItem = {
    id: "Produkt",
    name: "Produkt",
    goals: data,
  };
  const items: ProductRootItem[] = [PRODUCT_ROOT_ITEM];

  const handleAddEpic = (parentId: string) => {
    onAddGoal(parentId, "Product");
  };

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Produkt Mål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}>Time</Header>
        <Header width={530}>Kostnad</Header>
        <Header width={120}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          const root = item as ProductRootItem;
          const isRoot = (item as ProductRootItem).goals !== undefined;
          const isLiveGoal = !isRoot;

          const rootContainer = item as ProductRootItem;
          const goal = item as GoalCollection2;

          const children = isRoot ? rootContainer.goals : [];

          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>{isLiveGoal ? formatGoalID(goal) : item.name}</Cell>
              <Cell>{isLiveGoal ? goal.description : ""}</Cell>
              <Cell>{isLiveGoal ? goal.timeEstimate : ""} </Cell>
              <Cell>{isLiveGoal ? goal.costEstimate : ""}</Cell>
              <Cell>
                {isRoot && (
                  <Button
                    appearance="subtle"
                    // Pass the icon component *as JSX*
                    iconBefore={<AddIcon size="small" label="Add Epic" />}
                    onClick={() => handleAddEpic(item.id)}
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
