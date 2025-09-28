import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import Button from "@atlaskit/button";
import AddIcon from "@atlaskit/icon/glyph/add";
import { GoalCollection2 } from "../types/goal2";
import { formatGoalID } from "../types/goalIdFormatter";
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";

//1. Define the Root Container Type
interface ObjectiveRootItem {
  id: string;
  name: string;
  goals: GoalCollection2[];
}

interface ObjectiveTableTreeProps {
  data: GoalCollection2[];
  onAddGoal: (parentId: string, goalType: string, category?: string) => void;
  onEditGoal: (goal: GoalCollection2) => void;
  onDeleteGoal: (goalId: string) => void;
}

//2. Define the Union Type for Items
type TableItem = ObjectiveRootItem | GoalCollection2;

export const ObjectiveTableTree: React.FC<ObjectiveTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data,
}) => {
  const OBJECTIVE_ROOT_ITEM: ObjectiveRootItem = {
    id: "objective-root",
    name: "Formål",
    goals: data,
  };

  const items: ObjectiveRootItem[] = [OBJECTIVE_ROOT_ITEM];

  const handleAddObjective = (parentId: string) => {
    onAddGoal(parentId, "Objective");
  };

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Mål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}></Header>
        <Header width={530}></Header>
        <Header width={120}>Handlinger</Header>
      </Headers>

      <Rows
        // Cast to object[] to avoid TypeScript issues with the generic component
        items={items as TableItem[]}
        render={(item: TableItem) => {
          const root = item as ObjectiveRootItem;

          const isRoot = (item as ObjectiveRootItem).goals !== undefined;
          const isLiveGoal = !isRoot;

          const rootContainer = item as ObjectiveRootItem;
          const goal = item as GoalCollection2;

          const children = isRoot ? rootContainer.goals : [];

          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>{isLiveGoal ? formatGoalID(goal) : item.name}</Cell>
              <Cell>{isLiveGoal ? goal.description : ""}</Cell>
              <Cell></Cell>
              <Cell></Cell>
              <Cell>
                {isRoot && (
                  <Button
                    appearance="subtle"
                    // Pass the icon component *as JSX*
                    iconBefore={<AddIcon size="small" label="Add Epic" />}
                    onClick={() => handleAddObjective(item.id)}
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
