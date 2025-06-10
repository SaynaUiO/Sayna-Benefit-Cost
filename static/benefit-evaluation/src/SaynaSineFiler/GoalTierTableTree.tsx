import TableTree, {
  Cell,
  Header,
  Headers,
  Row,
  Rows,
} from "@atlaskit/table-tree";
import { useEffect, useState } from "react";
import { useAppContext } from "../Contexts/AppContext";
import { useAPI } from "../Contexts/ApiContext";
import Button from "@atlaskit/button";
import GoalDrawer from "./GoalDrawer";
import NewGoalTierButton from "./NewGoalTierButton";

import { IconButton } from "@atlaskit/button/new";
import MoreIcon from "@atlaskit/icon/glyph/more";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { GOAL_TYPE_DROPDOWN_ITEMS } from "./goalDropdownItems";

type Tier = {
  id: string;
  title: string;
  description: string;
  status?: string;
  subtask?: Tier[];
};

const GoalTierTableTree = () => {
  const [items, setItems] = useState<Tier[]>([]);
  const [scope] = useAppContext();
  const api = useAPI();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const allGoals = await api.goalCollection.getAll(scope.id);

      const goalMap: Map<string, Tier> = new Map();

      // Step 1: Map all goals into Tier objects
      allGoals.forEach((goal: any) => {
        goalMap.set(goal.id, {
          id: goal.id,
          title: goal.tier || goal.name,
          description: goal.description,
          status: goal.status || "Unknown",
          subtask: [],
        });
      });

      const rootItems: Tier[] = [];

      // Step 2: Organize into parent-child hierarchy
      allGoals.forEach((goal: any) => {
        const parentId = goal.parentId;
        if (parentId && goalMap.has(parentId)) {
          // This is a child, add it to the parent's subtask
          const parent = goalMap.get(parentId)!;
          parent.subtask!.push(goalMap.get(goal.id)!);
        } else {
          // This is a top-level item
          rootItems.push(goalMap.get(goal.id)!);
        }
      });

      setItems(rootItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [scope.id]);

  return (
    <TableTree label="Målstruktur">
      <Headers>
        <Header width={600}>Title</Header>
        <Header width={150}>Description</Header>
        <Header width={150}>Nytte poeng</Header>
        <Header width={150}>Status</Header>
        <Header width={150}>Frist</Header>
        <Header width={150}>Handling</Header>
      </Headers>
      <Rows
        items={items}
        render={({ id, title, description, subtask = [] }: Tier) => (
          <Row itemId={id} items={subtask} hasChildren={subtask.length > 0}>
            <Cell>{title}</Cell>
            <Cell>{description}</Cell>
            <Cell>0</Cell>
            <Cell>{status || "Unknown"}</Cell>
            <Cell>19.05.1999</Cell>
            <Cell>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* New Goal Tier Button for Subtasks */}
                <NewGoalTierButton
                  buttonLabel="+"
                  dropdownItems={GOAL_TYPE_DROPDOWN_ITEMS}
                  //Logic to save:
                  onSave={(type, parentId) => {
                    console.log(
                      "Saving new goal tier:",
                      type,
                      "under parent ID:",
                      parentId
                    );
                    setSelectedParentId(parentId || null); // Set the parent ID for the drawer
                    setDrawerOpen(true); // Open the drawer
                  }}
                  isPrimary={false} //Style
                  parentId={id} // Pass the parent ID dynamically
                />

                {/*DropdownMenu for Edit/Delete: */}
                <DropdownMenu
                  trigger={({ triggerRef, ...triggerProps }) => (
                    <Button
                      {...triggerProps}
                      iconBefore={<MoreIcon label="more" />}
                      ref={triggerRef}
                      aria-label="More actions"
                    />
                  )}
                  shouldRenderToParent
                >
                  <DropdownItemGroup>
                    <DropdownItem
                      onClick={() => {
                        setSelectedTier({
                          id,
                          title,
                          description,
                          status,
                          subtask: subtask || [], // Ensure subtask is always an array
                        });
                        setDrawerOpen(true); // Open the drawer
                      }}
                    >
                      Edit
                    </DropdownItem>

                    <DropdownItem
                      onClick={() => {
                        console.log("Deleting tier:", id);
                        // Logic to delete the tier
                      }}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownItemGroup>
                </DropdownMenu>
              </div>
            </Cell>
          </Row>
        )}
      />

      {drawerOpen && selectedTier && (
        <GoalDrawer
          title={`Add subtask to ${selectedTier.title}`}
          goalType={selectedTier.title}
          parentId={selectedParentId ?? undefined}
          isOpen={drawerOpen}
          onClose={(shouldRefresh) => {
            setDrawerOpen(false);
            setSelectedTier(null);
            setSelectedParentId(null);
            if (shouldRefresh) {
              fetchData();
            }
          }}
        />
      )}
    </TableTree>
  );
};

export default GoalTierTableTree;
