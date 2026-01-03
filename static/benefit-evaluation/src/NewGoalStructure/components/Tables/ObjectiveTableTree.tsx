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
import { Goal, GoalCollection } from "../../../Models";
import InlineEdit from "@atlaskit/inline-edit";
import { FORMAAL_COLLECTION_ID } from "../../constants/goalConstants";
import { useGoalStructure } from "../../hooks/useGoalStructure";
import TextArea from "@atlaskit/textarea";
import { SpotlightTarget } from "@atlaskit/onboarding";
import BitbucketCompareIcon from "@atlaskit/icon/glyph/bitbucket/compare";
import Lozenge from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";

// Import the hook
import { useTranslation } from "@forge/react";

interface ObjectiveRootItem {
  id: typeof FORMAAL_COLLECTION_ID;
  name: string;
  goals: Goal[];
  description?: string;
}
type TableItem = ObjectiveRootItem | Goal;

interface ObjectiveTableTreeProps {
  data: Goal[];
  onAddGoal: (
    parentId: string,
    goalCollectionId: string,
    category?: string
  ) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  onSetValues: (goals: Goal[], goalCollectionId: string) => void;
}

export const ObjectiveTableTree: React.FC<ObjectiveTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onSetValues,
  data: formaalGoals,
}) => {
  const { t } = useTranslation();
  const { formaalCollectionData, handlers } = useGoalStructure();
  const { handleUpdateCollectionDescription } = handlers;

  const OBJECTIVE_ROOT_ITEM: ObjectiveRootItem = {
    id: FORMAAL_COLLECTION_ID,
    name: t("objective_table.root_name"),
    goals: formaalGoals,
    description: formaalCollectionData?.description,
  };

  const items: ObjectiveRootItem[] = [OBJECTIVE_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>{t("objective_table.headers.name")}</Header>
        <Header width={720}>{t("objective_table.headers.description")}</Header>
        <Header width={90}></Header>
        <Header width={100}></Header>
        <Header width={125}>{t("objective_table.headers.points")}</Header>
        <Header width={130}>{t("objective_table.headers.actions")}</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          const isRoot = item.id === FORMAAL_COLLECTION_ID;
          const goal = item as Goal;
          const children = isRoot ? (item as ObjectiveRootItem).goals : [];
          const isLiveGoal = !isRoot;
          const primaryLabel = isRoot
            ? t("objective_table.root_name")
            : goal.key || goal.id;

          return (
            <Row
              itemId={item.id}
              items={children}
              hasChildren={isRoot}
              isDefaultExpanded
            >
              <Cell>
                <Tooltip content={t("objective_table.tooltip")}>
                  <strong>{primaryLabel}</strong>
                </Tooltip>
              </Cell>

              <Cell>
                {isRoot && (
                  <InlineEdit
                    defaultValue={(item as ObjectiveRootItem).description || ""}
                    editView={({ errorMessage, ...fieldProps }) => (
                      // @ts-ignore
                      <TextArea
                        {...fieldProps}
                        isCompact={false}
                        minimumRows={2}
                        resize="horizontal"
                        placeholder={t(
                          "objective_table.inline_edit.placeholder"
                        )}
                      />
                    )}
                    readView={() => (
                      <SpotlightTarget name="inline-text">
                        <div
                          style={{
                            minHeight: "2em",
                            padding: "6px",
                            wordBreak: "break-word",
                          }}
                        >
                          {(item as ObjectiveRootItem).description ||
                            t("objective_table.inline_edit.empty_state")}
                        </div>
                      </SpotlightTarget>
                    )}
                    onConfirm={(newValue) =>
                      handleUpdateCollectionDescription(
                        item as unknown as GoalCollection,
                        newValue
                      )
                    }
                    editButtonLabel={
                      (item as ObjectiveRootItem).description ||
                      t("objective_table.inline_edit.edit_button")
                    }
                    keepEditViewOpenOnBlur
                    readViewFitContainerWidth
                  />
                )}

                {isLiveGoal && goal.description}
              </Cell>

              <Cell></Cell>
              <Cell></Cell>

              <Cell>
                <Lozenge appearance="new" isBold>
                  {!isRoot && goal.balancedPoints?.value}
                </Lozenge>
              </Cell>

              <Cell>
                {isRoot && (
                  <>
                    <Button
                      appearance="subtle"
                      iconBefore={
                        <AddIcon
                          size="small"
                          label={t("objective_table.buttons.add")}
                        />
                      }
                      onClick={() =>
                        onAddGoal(OBJECTIVE_ROOT_ITEM.id, FORMAAL_COLLECTION_ID)
                      }
                    />
                    <SpotlightTarget name="formaal-weight">
                      <Button
                        appearance="subtle"
                        iconBefore={
                          <BitbucketCompareIcon
                            size="small"
                            label={t("objective_table.buttons.set_values")}
                          />
                        }
                        onClick={() =>
                          onSetValues(formaalGoals, FORMAAL_COLLECTION_ID)
                        }
                      />
                    </SpotlightTarget>
                  </>
                )}

                {isLiveGoal && (
                  <>
                    <Button
                      appearance="subtle"
                      iconBefore={
                        <EditIcon
                          size="small"
                          label={t("objective_table.buttons.edit")}
                        />
                      }
                      onClick={() => onEditGoal(goal)}
                    />
                    <Button
                      appearance="subtle"
                      iconBefore={
                        <TrashIcon
                          size="small"
                          label={t("objective_table.buttons.delete")}
                        />
                      }
                      onClick={() => onDeleteGoal(goal)}
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
