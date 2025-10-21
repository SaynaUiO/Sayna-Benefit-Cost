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
import { InlineEditableTextfield } from "@atlaskit/inline-edit";
import { FORMAAL_COLLECTION_ID } from "../../constants/goalConstants";

interface ObjectiveRootItem {
  id: typeof FORMAAL_COLLECTION_ID;
  name: string;
  goals: Goal[];
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
  onDeleteGoal: (goalId: string) => void;
}

export const ObjectiveTableTree: React.FC<ObjectiveTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: formaalGoals,
}) => {
  const FORMAAL_COLLECTION_ID = "root-formaal";

  const OBJECTIVE_ROOT_ITEM: ObjectiveRootItem = {
    id: FORMAAL_COLLECTION_ID,
    name: "Formål",
    goals: formaalGoals,
  };

  const items: ObjectiveRootItem[] = [OBJECTIVE_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Formål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}></Header>
        <Header width={530}></Header>
        <Header width={120}>Handlinger</Header>
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
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              {/* KOLONNE 1: Formål Navn / Nøkkel */}
              <Cell>
                <strong>{primaryLabel}</strong>
              </Cell>

              {/* KOLONNE 2: Beskrivelse */}
              <Cell>
                {isRoot && (
                  <InlineEditableTextfield
                    testId="editable-text-field"
                    defaultValue={""}
                    onConfirm={(newValue) =>
                      console.log("Oppdatert rot-beskrivelse:", newValue)
                    }
                    placeholder={
                      goal.description || "Legg til en beskrivelse her"
                    }
                    hideActionButtons
                  />
                )}
                {isLiveGoal && goal.description}
              </Cell>

              <Cell></Cell>
              <Cell></Cell>

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
