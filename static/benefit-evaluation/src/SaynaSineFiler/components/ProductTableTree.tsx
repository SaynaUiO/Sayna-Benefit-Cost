import React from "react";
import TableTree, {
  Rows,
  Row,
  Cell,
  Header,
  Headers,
} from "@atlaskit/table-tree";
import { Epic } from "../types/Epic";
import { PRODUCT_GOALS } from "../data/productMockData";

// 1. Define the Root Container Type
interface ProductRootItem {
  id: string;
  name: string;
  goals: Epic[];
}

// 2. Define the Union Type for Items
type TableItem = Epic | ProductRootItem;

const PRODUCT_ROOT_ITEM: ProductRootItem = {
  id: "product-root",
  name: "Produkt",
  goals: PRODUCT_GOALS,
};

export const ProductTableTree = () => {
  // We only pass the root item to the TableTree
  const items: ProductRootItem[] = [PRODUCT_ROOT_ITEM];

  return (
    <TableTree>
      <Headers>
        <Header width={250}>Produkt Mål</Header>
        <Header width={400}>Beskrivelse</Header>
        <Header width={100}>Time</Header>
        <Header width={100}>Kostnad</Header>
      </Headers>

      <Rows
        // 3. Cast the items array to the common type
        items={items as TableItem[]}
        render={(item: TableItem) => {
          // Safely check if the item is the root container by checking for the 'goals' array
          const isRoot = (item as ProductRootItem).goals !== undefined;

          // Safely extract properties using type assertions
          const epic = item as Epic;
          const root = item as ProductRootItem;

          // Safely get children: if it's the root, use its 'goals'; otherwise, use an empty array.
          const children = isRoot ? root.goals : [];

          return (
            <Row itemId={item.id} items={children} hasChildren={isRoot}>
              <Cell>{item.name}</Cell>

              {/* The Root row shows empty cells for these columns */}
              {/* Child Epic rows use the Epic properties */}
              <Cell>{isRoot ? "" : epic.description}</Cell>
              <Cell>{isRoot ? "" : epic.timeEstimate}</Cell>
              <Cell>{isRoot ? "" : epic.costEstimate}</Cell>
            </Row>
          );
        }}
      />
    </TableTree>
  );
};
