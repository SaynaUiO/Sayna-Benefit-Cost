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
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";
import { Goal } from "../../Models";
import BitbucketCompareIcon from "@atlaskit/icon/glyph/bitbucket/compare";
import Lozenge from "@atlaskit/lozenge";

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
  onAddGoal: (
    parentId: string, // Item ID som klikkes (Root ID)
    goalCollectionId: string, // Den faktiske collection ID'en vi skal opprette i
    category?: string
  ) => void;
  onEditGoal: (goal: Goal) => void; //redigerer en epic
  onDeleteGoal: (goalId: string) => void; //sletter en epic
  onSetCostTime: (goals: Goal[]) => void; // Ny prop
}

export const EpicTableTree: React.FC<EpicTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: epicGoals, // Omdøpt for klarhet
  onSetCostTime,
}) => {
  const isDataEmpty = epicGoals.length === 0;

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

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Produktmål</Header>
        <Header width={700}>Beskrivelse</Header>
        <Header width={100}>Tid</Header>
        <Header width={120}>Kostnad</Header>
        <Header width={100}>Benefit Points</Header>
        <Header width={130}>Handlinger</Header>
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
              <Cell>
                <strong>{isRoot ? item.id : goal.key}</strong>
              </Cell>
              <Cell>{!isRoot && goal.description}</Cell>
              <Cell>
                {" "}
                <Lozenge appearance="moved" isBold>
                  {!isRoot && goal.issueCost?.time}
                </Lozenge>
              </Cell>
              <Cell>
                {" "}
                <Lozenge appearance="success" isBold>
                  {!isRoot && goal.issueCost?.cost}
                </Lozenge>
              </Cell>
              <Cell>
                {" "}
                <Lozenge appearance="new" isBold>
                  {!isRoot && goal.balancedPoints?.value}{" "}
                </Lozenge>
              </Cell>

              <Cell>
                {isRoot && (
                  <Button
                    appearance="subtle"
                    // Pass the icon component *as JSX*
                    iconBefore={<AddIcon size="small" label="Add Epic" />}
                    onClick={() =>
                      // OPPDATERT: Sender parent ID (Root ID) og Collection ID
                      onAddGoal(PRODUCT_ROOT_ITEM.id, "root-epic")
                    }
                  />
                )}

                {/* Cost/Time Button  */}
                {isRoot && (
                  <Button
                    appearance="subtle"
                    iconBefore={<BitbucketCompareIcon size="small" label="" />}
                    isDisabled={isDataEmpty} // Deaktiver knappen hvis det ikke er noen Epics
                    onClick={() => onSetCostTime(epicGoals)} // Sender alle Epics
                  ></Button>
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
