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
import TextArea from "@atlaskit/textarea";
import Textfield from "@atlaskit/textfield";
import { Box } from "@atlaskit/primitives";
import { InlineEditableTextfield } from "@atlaskit/inline-edit";

// Definerer root-element (Bruker en konstant ID for sikkerhet)
const OBJECTIVE_ROOT_ID = "Formål";

interface ObjectiveRootItem {
  id: typeof OBJECTIVE_ROOT_ID; // Bruk konstanten som type
  name: string;
  goals: Goal[];
}

// 2. Define the Union Type for Items
type TableItem = ObjectiveRootItem | Goal;

interface ObjectiveTableTreeProps {
  data: Goal[];
  // Endret goalType til GoalCollectionId for bedre konsistens
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

  // Lag rot-objektet
  const OBJECTIVE_ROOT_ITEM: ObjectiveRootItem = {
    id: OBJECTIVE_ROOT_ID,
    name: "Formål",
    goals: formaalGoals,
  };

  const items: ObjectiveRootItem[] = [OBJECTIVE_ROOT_ITEM];

  const handleAddObjective = () => {
    // Legger til nytt Formål under rot-elementet
    onAddGoal(OBJECTIVE_ROOT_ITEM.id, FORMAAL_COLLECTION_ID);
  };

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
          // --- KORRIGERT LOGIKK ---
          const isRoot = item.id === OBJECTIVE_ROOT_ID; // Bruker konstant/korrekt ID
          const goal = item as Goal;

          // Fjerner unødvendig 'unknown as' casting
          const children = isRoot ? (item as ObjectiveRootItem).goals : [];

          const isLiveGoal = !isRoot;

          // Definer label for første celle
          const primaryLabel = isRoot ? item.id : goal.key || goal.id;

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
                {/* Legg til-knapp vises KUN på Root-nivå */}
                {isRoot && (
                  <Button
                    appearance="subtle"
                    iconBefore={
                      <AddIcon size="small" label="Legg til Formål" />
                    }
                    onClick={handleAddObjective}
                  />
                )}

                {/* Edit & Delete knapper vises KUN på Formål-nivå */}
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
