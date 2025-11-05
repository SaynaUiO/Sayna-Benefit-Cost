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
import InlineEdit, { InlineEditableTextfield } from "@atlaskit/inline-edit";
import { FORMAAL_COLLECTION_ID } from "../../constants/goalConstants";
import { useGoalStructure } from "../../hooks/useGoalStructure";
import TextArea from "@atlaskit/textarea";
import { SpotlightTarget } from "@atlaskit/onboarding";
import BitbucketCompareIcon from "@atlaskit/icon/glyph/bitbucket/compare";
import Lozenge from "@atlaskit/lozenge";

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
}

export const ObjectiveTableTree: React.FC<ObjectiveTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: formaalGoals,
}) => {
  const { formaalCollectionData, handlers } = useGoalStructure();
  const { handleUpdateCollectionDescription } = handlers;

  const OBJECTIVE_ROOT_ITEM: ObjectiveRootItem = {
    id: FORMAAL_COLLECTION_ID,
    name: "Formål",
    goals: formaalGoals,
    description: formaalCollectionData?.description,
  };

  const items: ObjectiveRootItem[] = [OBJECTIVE_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Formål</Header>
        <Header width={720}>Beskrivelse</Header>
        <Header width={90}></Header>
        <Header width={100}></Header>
        <Header width={125}>Nyttepoeng</Header>
        <Header width={130}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          const isRoot = item.id === FORMAAL_COLLECTION_ID; // Bruker konstant/korrekt ID
          const goal = item as Goal;
          const children = isRoot ? (item as ObjectiveRootItem).goals : [];
          const isLiveGoal = !isRoot;
          const primaryLabel = isRoot ? "Formål" : goal.key || goal.id;

          return (
            <Row
              itemId={item.id}
              items={children}
              hasChildren={isRoot}
              isDefaultExpanded
            >
              {/* KOLONNE 1: Formål Navn / Nøkkel */}
              <Cell>
                <strong>{primaryLabel}</strong>
              </Cell>

              {/* KOLONNE 2: Beskrivelse */}
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
                        placeholder="Skriv inn beskrivelse her..."
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
                            "Legg til en beskrivelse her"}
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
                      "Legg til beskrivelse"
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
                {" "}
                <Lozenge appearance="new" isBold>
                  {!isRoot && goal.balancedPoints?.value}{" "}
                </Lozenge>
              </Cell>

              {/* KOLONNE 5: Handlinger */}
              <Cell>
                {isRoot && (
                  <Button
                    appearance="subtle"
                    iconBefore={
                      <AddIcon size="small" label="Legg til Formål" />
                    }
                    onClick={() =>
                      onAddGoal(OBJECTIVE_ROOT_ITEM.id, FORMAAL_COLLECTION_ID)
                    }
                  />
                )}

                {isRoot && (
                  <Button
                    appearance="subtle"
                    iconBefore={<BitbucketCompareIcon size="small" label="" />}
                    onClick={() => {}} // Sender alle Epics
                  ></Button>
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
