import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import Button, { ButtonGroup } from "@atlaskit/button";
import AddIcon from "@atlaskit/icon/glyph/add";
import EditIcon from "@atlaskit/icon/glyph/edit";
import TrashIcon from "@atlaskit/icon/glyph/trash";
import { Goal } from "../../../Models";
import BitbucketCompareIcon from "@atlaskit/icon/glyph/bitbucket/compare";
import Lozenge from "@atlaskit/lozenge";
import { EPIC_COLLECTION_ID } from "../../constants/goalConstants";
import { SpotlightTarget } from "@atlaskit/onboarding";
import Tooltip from "@atlaskit/tooltip";

// Import the hook
import { useTranslation } from "@forge/react";

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
  const { t } = useTranslation();
  const isDataEmpty = epicGoals.length === 0;

  const PRODUCT_ROOT_ITEM: ProductRootItem = {
    id: EPIC_COLLECTION_ID,
    name: t("epic_table.root_name"),
    goals: epicGoals,
  };

  const items: ProductRootItem[] = [PRODUCT_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>{t("epic_table.headers.name")}</Header>
        <Header width={720}>{t("epic_table.headers.description")}</Header>
        <Header width={90}>{t("epic_table.headers.time")}</Header>
        <Header width={100}>{t("epic_table.headers.cost")}</Header>
        <Header width={125}>{t("epic_table.headers.points")}</Header>
        <Header width={130}>{t("epic_table.headers.actions")}</Header>
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
            <Row
              itemId={item.id}
              items={children}
              hasChildren={isRoot}
              isDefaultExpanded
            >
              <Cell>
                <Tooltip content={t("epic_table.tooltip")}>
                  <strong>{isRoot ? PRODUCT_ROOT_ITEM.name : goal.key}</strong>
                </Tooltip>
              </Cell>
              <Cell>{!isRoot && goal.description}</Cell>
              <Cell>
                <Lozenge appearance="moved" isBold>
                  {!isRoot && goal.issueCost?.time}
                </Lozenge>
              </Cell>
              <Cell>
                <Lozenge appearance="success" isBold>
                  {!isRoot && goal.issueCost?.cost}
                </Lozenge>
              </Cell>
              <Cell>
                <Lozenge appearance="new" isBold>
                  {!isRoot && goal.balancedPoints?.value}
                </Lozenge>
              </Cell>

              <Cell>
                {isRoot && (
                  <SpotlightTarget name="add-goal">
                    <Button
                      appearance="subtle"
                      iconBefore={
                        <AddIcon
                          size="small"
                          label={t("epic_table.buttons.add")}
                        />
                      }
                      onClick={() =>
                        onAddGoal(PRODUCT_ROOT_ITEM.id, EPIC_COLLECTION_ID)
                      }
                    />
                  </SpotlightTarget>
                )}

                {isRoot && (
                  <SpotlightTarget name="cost/time">
                    <Button
                      appearance="subtle"
                      iconBefore={
                        <BitbucketCompareIcon
                          size="small"
                          label={t("epic_table.buttons.set_cost_time")}
                        />
                      }
                      isDisabled={isDataEmpty}
                      onClick={() => onSetCostTime(epicGoals)}
                    />
                  </SpotlightTarget>
                )}

                <SpotlightTarget name="edit/delete-goal">
                  {isLiveGoal && (
                    <ButtonGroup>
                      <Button
                        appearance="subtle"
                        iconBefore={
                          <EditIcon
                            size="small"
                            label={t("epic_table.buttons.edit")}
                          />
                        }
                        onClick={() => onEditGoal(goal)}
                      />
                      <Button
                        appearance="subtle"
                        iconBefore={
                          <TrashIcon
                            size="small"
                            label={t("epic_table.buttons.delete")}
                          />
                        }
                        onClick={() => onDeleteGoal(goal)}
                      />
                    </ButtonGroup>
                  )}
                </SpotlightTarget>
              </Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
