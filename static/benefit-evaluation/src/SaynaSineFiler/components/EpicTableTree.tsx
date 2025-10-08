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
import { formatGoalID } from "../utils/goalIdFormatter";
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";
import { Goal } from "../../Models";

//Definer root-element (Produkt):
interface ProductRootItem {
  id: "Produkt";
  name: string;
  goals: Goal[];
}

// 2. Define the Union Type for Items
type TableItem = ProductRootItem | Goal;

interface EpicTableTreeProps {
  data: Goal[]; //Henter ut alle epicsene
  onAddGoal: (parentId: string, goalCollectionId: string) => void; //legger til en epic
  onEditGoal: (goal: Goal) => void; //redigerer en epic
  onDeleteGoal: (goalId: string) => void; //sletter en epic
}

export const EpicTableTree: React.FC<EpicTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: epicGoals, // Omdøpt for klarhet
}) => {
  // Hardkoder GoalCollectionId for Epics, basert på tidligere debugging
  const EPIC_COLLECTION_ID = "root-epic";

  // Lag den hardkodede Root-noden
  const PRODUCT_ROOT_ITEM: ProductRootItem = {
    id: "Produkt",
    name: "Produkt",
    goals: epicGoals, // Alle Epics er barn av denne roten
  };

  // Datakilden for Rows er nå et array med kun Root-elementet
  const items: ProductRootItem[] = [PRODUCT_ROOT_ITEM];

  const handleAddEpic = () => {
    // Når brukeren trykker "Add Goal" på toppen, legges den til under root-epic
    // Vi sender "" som parentId siden det er et toppnivå mål i denne samlingen.
    onAddGoal(PRODUCT_ROOT_ITEM.id, EPIC_COLLECTION_ID);
  };

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Produkt Mål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}>Tid</Header>
        <Header width={530}>Kostnad</Header>
        <Header width={120}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          // Bestemmer om elementet er Root eller et Live Goal (Epic)
          const isRoot = item.id === "Produkt";
          const goal = item as Goal; // Er kun gyldig hvis !isRoot

          // Definerer barna (Epics) hvis det er Root
          const children = isRoot ? (item as ProductRootItem).goals : [];
          const isLiveGoal = !isRoot;
          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>{isRoot ? item.id : goal.key}</Cell>
              <Cell>{!isRoot && goal.description}</Cell>
              <Cell> </Cell>
              <Cell> </Cell>

              <Cell>
                {isRoot && (
                  <Button
                    appearance="subtle"
                    // Pass the icon component *as JSX*
                    iconBefore={<AddIcon size="small" label="Add Epic" />}
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
