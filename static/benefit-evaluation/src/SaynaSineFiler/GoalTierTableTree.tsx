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
import GoalDrawer from "./CreateGoalDrawer";

type Tier = {
  id: string;
  title: string;
  description: string;
  subtask?: Tier[];
};

const GoalTierTableTree = () => {
  const [items, setItems] = useState<Tier[]>([]);
  const [scope] = useAppContext();
  const api = useAPI();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [selectedGoalType, setSelectedGoalType] = useState<string | null>(null);

  const fetchData = async () => {
    const allGoals = await api.goalCollection.getAll(scope.id);

    const goalMap: Map<string, Tier> = new Map();

    // Step 1: Map all goals into Tier objects
    allGoals.forEach((goal: any) => {
      goalMap.set(goal.id, {
        id: goal.id,
        title: goal.tier || goal.name,
        description: goal.description,
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
  };

  useEffect(() => {
    fetchData();
  }, [scope.id]);

  return (
    <TableTree label="Målstruktur">
      <Headers>
        <Header width={150}>Title</Header>
        <Header width={300}>Description</Header>
        <Header width={300}>Handling</Header>
      </Headers>
      <Rows
        items={items}
        render={({ id, title, description, subtask = [] }: Tier) => (
          <Row itemId={id} items={subtask} hasChildren={subtask.length > 0}>
            <Cell>{title}</Cell>
            <Cell>{description}</Cell>
            <Cell>
              <Button
                appearance="subtle-link"
                spacing="none"
                onClick={() => {
                  setSelectedTier({ id, title, description, subtask });
                  setDrawerOpen(true);
                  setSelectedParentId(id); // 👈 set the parent ID
                }}
              >
                ＋
              </Button>
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
              fetchData(); // 👈 this is all you need!
            }
            if (shouldRefresh) {
              api.goalCollection.getAll(scope.id).then((allGoals) => {
                const mapped: Tier[] = allGoals.map((goal: any) => ({
                  id: goal.id,
                  title: goal.tier || goal.name,
                  description: goal.description,
                }));
              });
            }
          }}
        />
      )}
    </TableTree>
  );
};

export default GoalTierTableTree;
