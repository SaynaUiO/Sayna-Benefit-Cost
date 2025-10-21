import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";
import Button from "@atlaskit/button";
import { Goal } from "../../Models";
import AddIcon from "@atlaskit/icon/glyph/add";
import Lozenge from "@atlaskit/lozenge";
import { NYTTE_COLLECTION_ID } from "../constants/goalConstants";

interface BenefitRootItem {
  id: typeof NYTTE_COLLECTION_ID;
  name: string;
  goals: Goal[];
}

type TableItem = BenefitRootItem | Goal;

interface BenefitTableTreeProps {
  data: Goal[];
  onAddGoal: (
    parentId: string,
    goalCollectionId: string,
    category?: string
  ) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const BenefitTableTree: React.FC<BenefitTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: benefitgoals,
}) => {
  const isDataEmpty = benefitgoals.length === 0;

  const BENEFIT_ROOT_ITEM: BenefitRootItem = {
    id: NYTTE_COLLECTION_ID,
    name: "Planlagte Nyttevirkninger",
    goals: benefitgoals,
  };

  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];
  return (
    <TableTree>
      <Headers>
        <Header width={250}>Planlagte Nyttevirkninger</Header>
        <Header width={700}>Beskrivelse</Header>
        <Header width={100}></Header>
        <Header width={120}></Header>
        <Header width={100}>Weight</Header>
        <Header width={130}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          const isRoot = item.id === NYTTE_COLLECTION_ID;
          const goal = item as Goal; // Kun gyldig hvis !isRoot
          const children = isRoot ? (item as BenefitRootItem).goals : [];
          const isLiveGoal = !isRoot;
          const primaryLabel = isRoot
            ? "Planlagt Nyttevirkning"
            : goal.key || goal.id;

          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>
                <strong>{primaryLabel}</strong>
              </Cell>

              <Cell>{isLiveGoal ? goal.description : ""}</Cell>

              <Cell></Cell>
              <Cell></Cell>

              <Cell>
                <Lozenge appearance="new" isBold>
                  {!isRoot && goal.balancedPoints?.value}
                </Lozenge>
              </Cell>

              <Cell>
                {isRoot && (
                  <Button
                    appearance="subtle"
                    iconBefore={<AddIcon size="small" label="Legg til " />}
                    onClick={() =>
                      onAddGoal(BENEFIT_ROOT_ITEM.id, NYTTE_COLLECTION_ID)
                    }
                  />
                )}

                {isLiveGoal && (
                  <>
                    <Button
                      appearance="subtle"
                      iconBefore={<EditIcon size="small" label="Rediger Mål" />}
                      onClick={() => onEditGoal(goal)}
                    />
                    <Button
                      appearance="subtle"
                      iconBefore={<TrashIcon size="small" label="Slett Mål" />}
                      onClick={() => onDeleteGoal(goal.id)}
                    />
                  </>
                )}
              </Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
