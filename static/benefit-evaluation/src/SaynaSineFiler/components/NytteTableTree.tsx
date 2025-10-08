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

// --- NY/OPPDATERT DEFINISJON ---
// Bruk string for ID/Name for å matche Goal.goalCollectionId
type GoalCollectionID = string;

// GoalCollection IDene du har i DB:
const EFFEKTMAAL_ID: GoalCollectionID = "root-effektmaal";
const ORGANISASJONSMAAL_ID: GoalCollectionID = "root-organisasjonsmaal"; // Antatt ID
const SAMFUNNSMAAL_ID: GoalCollectionID = "root-samfunnsmaal"; // Antatt ID

// Definer de Kategori-IDene som skal vises i denne tabellen
const CATEGORY_IDS_TO_DISPLAY: GoalCollectionID[] = [EFFEKTMAAL_ID];

interface CategoryItem {
  id: GoalCollectionID;
  name: string; // Navnet (f.eks. "Effektmål")
  goals: Goal[]; // Barna er målene i denne samlingen
}

interface BenefitRootItem {
  id: "benefit-root"; // Hardkodet ID
  name: "Planlagte Nyttevirkninger";
  categories: CategoryItem[]; // Omdøpt fra 'goals' til 'categories' for klarhet
}

// Union Type for TableTree rendering
type TableItem = BenefitRootItem | CategoryItem | Goal;

// Dropdown-items (bruk ID som value for enklere handling)
const CATEGORY_DROPDOWN_ITEMS = [
  { label: "Legg til Samfunnsmål", value: SAMFUNNSMAAL_ID },
  { label: "Legg til Organisasjonsmål", value: ORGANISASJONSMAAL_ID },
  { label: "Legg til Effektmål", value: EFFEKTMAAL_ID },
];

// Define the component props
interface BenefitTableTreeProps {
  data: Goal[]; // Alle Effektmål, Org.mål, Samf.mål
  onAddGoal: (goalCollectionId: string) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

// --- Main Component ---
export const BenefitTableTree: React.FC<BenefitTableTreeProps> = ({
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  data, // Alle mål
}) => {
  // 1. Lag Kategori-objektene (Effektmål, Org.mål, etc.)
  const liveCategories: CategoryItem[] = CATEGORY_IDS_TO_DISPLAY.map(
    (collectionId) => {
      const name = collectionId.split("-")[1] || collectionId;

      return {
        id: collectionId,
        name: name.charAt(0).toUpperCase() + name.slice(1), // Formatterer navnet (f.eks. 'effektmaal' -> 'Effektmål')
        goals: data.filter((goal) => goal.goalCollectionId === collectionId),
      };
    }
  );

  // 2. Lag Rot-objektet
  const BENEFIT_ROOT_ITEM: BenefitRootItem = {
    id: "benefit-root",
    name: "Planlagte Nyttevirkninger",
    categories: liveCategories,
  };

  const items: BenefitRootItem[] = [BENEFIT_ROOT_ITEM];

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
          const isRoot = item.id === "benefit-root";
          const isCategory =
            !isRoot && (item as CategoryItem).goals !== undefined;
          const isLiveGoal = !isRoot && !isCategory;

          const children = isRoot
            ? (item as BenefitRootItem).categories
            : isCategory
            ? (item as CategoryItem).goals
            : [];

          const hasChildren = children.length > 0;

          const itemGoal = item as Goal; // Kun gyldig hvis isLiveGoal

          // Hent label for Cell 1 (Root/Kategori/Mål ID)
          let primaryLabel = "";
          if (isRoot) primaryLabel = item.id;
          else if (isCategory) primaryLabel = (item as CategoryItem).name;
          else if (isLiveGoal) primaryLabel = itemGoal.key || itemGoal.id;

          return (
            <Row itemId={item.id} items={children} hasChildren={hasChildren}>
              <Cell>
                <strong>{!isRoot ? primaryLabel : "Nyttevirkning"}</strong>
              </Cell>

              <Cell>{isLiveGoal ? itemGoal.description : ""}</Cell>

              <Cell></Cell>
              <Cell></Cell>

              <Cell>
                <Lozenge appearance="new" isBold>
                  {!isRoot && itemGoal.balancedPoints?.value}
                </Lozenge>
              </Cell>

              <Cell>
                {/* Legg til-knapp kan også vises på Kategori-nivå om ønskelig: */}
                {isCategory && (
                  <Button
                    appearance="subtle"
                    iconBefore={<AddIcon size="small" label="Legg til " />}
                    onClick={() => onAddGoal(EFFEKTMAAL_ID)}
                  />
                )}

                {/* Rediger/Slett-knapper vises KUN på Mål-nivå */}
                {isLiveGoal && (
                  <>
                    <Button
                      appearance="subtle"
                      iconBefore={<EditIcon size="small" label="Rediger Mål" />}
                      onClick={() => onEditGoal(itemGoal)}
                    />
                    <Button
                      appearance="subtle"
                      iconBefore={<TrashIcon size="small" label="Slett Mål" />}
                      onClick={() => onDeleteGoal(itemGoal.id)}
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
