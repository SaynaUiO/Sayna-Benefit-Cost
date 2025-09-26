import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import { Objective } from "../types/objective";
import { OBJECTIVE_GOALS } from "../data/objectiveMockData";

//1. Define the Root Container Type
interface ObjectiveRootItem {
  id: string;
  name: string;
  goals: Objective[];
}

//2. Define the Union Type for Items
type TableItem = Objective | ObjectiveRootItem;

const OBJECTIVE_ROOT_ITEM: ObjectiveRootItem = {
  id: "Formål",
  name: "Formål",
  goals: OBJECTIVE_GOALS,
};

export const ObjectiveTableTree = () => {
  // The items array only contains the root container
  const items = [OBJECTIVE_ROOT_ITEM];

  // Define a Union Type that covers the root and the objectives
  type TableItem = typeof OBJECTIVE_ROOT_ITEM | Objective;

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Mål</Header>
        <Header width={500}>Beskrivelse</Header>
      </Headers>

      <Rows
        // Cast to object[] to avoid TypeScript issues with the generic component
        items={items as TableItem[]}
        render={(item: TableItem) => {
          // Safely extract properties using type assertions
          const objective = item as Objective;
          const root = item as ObjectiveRootItem;

          const isRoot = (item as ObjectiveRootItem).goals !== undefined;
          // Determine if this is one of the actual goals (O1, O2, O3)
          const isObjective = (item as Objective).description !== undefined;

          // Safely get children: if it's the root, use its 'goals'; otherwise, use an empty array.
          const children = isRoot ? root.goals : [];

          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>{isRoot ? item.id : item.name}</Cell>
              <Cell>{isRoot ? "" : objective.description}</Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
