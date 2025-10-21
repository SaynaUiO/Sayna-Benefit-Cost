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

const BENEFIT_COLLECTION_ID = "root-effektmaal";

interface BenefitRootItem {
  id: typeof BENEFIT_COLLECTION_ID; // Hardkodet ID
  // name: "Planlagte Nyttevirkninger";
  name: string;
  goals: Goal[]; // Omdøpt fra 'goals' til 'categories' for klarhet
}

type TableItem = BenefitRootItem | Goal;

// Define the component props
interface BenefitTableTreeProps {
  data: Goal[]; // Alle Effektmål, Org.mål, Samf.mål
  onAddGoal: (
    parentId: string, // Item ID som klikkes (Root ID)
    goalCollectionId: string, // Den faktiske collection ID'en vi skal opprette i
    category?: string
  ) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

// --- Main Component ---
export const BenefitTableTree: React.FC<BenefitTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data: benefitgoals, // Alle mål
}) => {
  const isDataEmpty = benefitgoals.length === 0;

  const BENEFIT_ROOT_ITEM: BenefitRootItem = {
    id: BENEFIT_COLLECTION_ID,
    name: "Planlagte Nyttevirkninger",
    goals: benefitgoals,
  };

  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];

  // const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Nyttevirkninger</Header>
        <Header width={700}>Beskrivelse</Header>
        <Header width={100}></Header>
        <Header width={120}></Header>
        <Header width={100}>Weight</Header>
        <Header width={130}>Handlinger</Header>
      </Headers>

      <Rows
        items={items as TableItem[]}
        render={(item: TableItem) => {
          // Bruk type guards for renere logikk
          const isRoot = item.id === BENEFIT_COLLECTION_ID;
          const goal = item as Goal; // Kun gyldig hvis !isRoot

          // Fjerner unødvendig 'unknown as' casting
          const children = isRoot ? (item as BenefitRootItem).goals : [];

          const isLiveGoal = !isRoot;

          // Definer label for første celle
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
                {/* Legg til-knapp kan også vises på Kategori-nivå om ønskelig: */}
                {isRoot && (
                  <Button
                    appearance="subtle"
                    iconBefore={<AddIcon size="small" label="Legg til " />}
                    onClick={() =>
                      // OPPDATERT: Sender parent ID (Root ID) og Collection ID
                      onAddGoal(BENEFIT_ROOT_ITEM.id, BENEFIT_COLLECTION_ID)
                    }
                  />
                )}

                {/* Rediger/Slett-knapper vises KUN på Mål-nivå */}
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
