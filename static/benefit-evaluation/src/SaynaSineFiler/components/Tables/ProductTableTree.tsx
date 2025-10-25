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
import { Goal } from "../../../Models";
import BitbucketCompareIcon from "@atlaskit/icon/glyph/bitbucket/compare";
import Lozenge from "@atlaskit/lozenge";
import { EPIC_COLLECTION_ID } from "../../constants/goalConstants";
import { SpotlightTarget } from "@atlaskit/onboarding";

interface ProductRootItem {
  id: typeof EPIC_COLLECTION_ID;
  name: string;
  goals: Goal[];
}

type TableItem = ProductRootItem | Goal;

interface EpicTableTreeProps {
  data: Goal[];
  onAddGoal: (
    parentId: string,
    goalCollectionId: string,
    category?: string
  ) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  onSetCostTime: (goals: Goal[]) => void;
}

export const EpicTableTree: React.FC<EpicTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: epicGoals,
  onSetCostTime,
}) => {
  const isDataEmpty = epicGoals.length === 0;

  const PRODUCT_ROOT_ITEM: ProductRootItem = {
    id: EPIC_COLLECTION_ID,
    name: "Produkt",
    goals: epicGoals,
  };

  const items: ProductRootItem[] = [PRODUCT_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Produktmål</Header>
        <Header width={700}>Beskrivelse</Header>
        <Header width={100}>Tid</Header>
        <Header width={120}>Kostnad</Header>
        <Header width={100}>Nytte Poeng</Header>
        <Header width={130}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          const isRoot = item.id === EPIC_COLLECTION_ID;
          const goal = item as unknown as Goal;
          const rootItem = item as unknown as ProductRootItem;
          const children = isRoot ? rootItem.goals : [];
          const isLiveGoal = !isRoot;

          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>
                <strong>{isRoot ? PRODUCT_ROOT_ITEM.name : goal.key}</strong>
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
                    iconBefore={<AddIcon size="small" label="Add Epic" />}
                    onClick={() =>
                      onAddGoal(PRODUCT_ROOT_ITEM.id, EPIC_COLLECTION_ID)
                    }
                  />
                )}

                {/* Cost/Time Button  */}
                <SpotlightTarget name="cost/time">
                  {isRoot && (
                    <Button
                      appearance="subtle"
                      iconBefore={
                        <BitbucketCompareIcon size="small" label="" />
                      }
                      isDisabled={isDataEmpty} // Deaktiver knappen hvis det ikke er noen Epics
                      onClick={() => onSetCostTime(epicGoals)} // Sender alle Epics
                    ></Button>
                  )}
                </SpotlightTarget>

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
                    onClick={() => onDeleteGoal(goal)}
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
